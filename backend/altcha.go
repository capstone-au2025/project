package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log/slog"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"
)

// ---- Types used by the challenge/verify flow ----

type altchaChallenge struct {
	// Opaque token the client must return as-is
	Token string `json:"token"`
	// HMAC-SHA256(token, secret), base64
	Hash string `json:"hash"`
	// Optional: client can show/use this (not required)
	ExpiresUTC string `json:"expires"`
}

type altchaVerifyRequest struct {
	Token string `json:"token"`
	Hash  string `json:"hash"`
}

type altchaVerifyResponse struct {
	Ok bool `json:"ok"`
}

// ---- Helpers ----

func hmacKey() (string, error) {
	secret := os.Getenv("ALTCHA_HMAC_KEY")
	if secret == "" {
		return "", errors.New("ALTCHA_HMAC_KEY not set")
	}
	return secret, nil
}

func signToken(token string, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(token))
	sig := mac.Sum(nil)
	return base64.StdEncoding.EncodeToString(sig)
}

// token = base64("nonce:epochSeconds")
func makeToken() string {
	nonce := strconv.FormatInt(rand.Int63(), 10)
	exp := time.Now().Add(5 * time.Minute).Unix() // token valid for 5 minutes
	raw := nonce + ":" + strconv.FormatInt(exp, 10)
	return base64.StdEncoding.EncodeToString([]byte(raw))
}

func parseToken(tokenB64 string) (nonce string, exp time.Time, err error) {
	raw, err := base64.StdEncoding.DecodeString(tokenB64)
	if err != nil {
		return "", time.Time{}, err
	}
	parts := string(raw)
	// format: "<nonce>:<epoch>"
	i := -1
	for idx := range parts {
		if parts[idx] == ':' {
			i = idx
			break
		}
	}
	if i < 0 {
		return "", time.Time{}, errors.New("bad token")
	}
	nonce = parts[:i]
	epochStr := parts[i+1:]
	secs, err := strconv.ParseInt(epochStr, 10, 64)
	if err != nil {
		return "", time.Time{}, err
	}
	exp = time.Unix(secs, 0).UTC()
	return nonce, exp, nil
}

// ---- Handlers ----

// GET /altcha/challenge
func altchaChallengeHandler(w http.ResponseWriter, r *http.Request) {
	secret, err := hmacKey()
	if err != nil {
		http.Error(w, "server misconfigured", http.StatusInternalServerError)
		slog.Error("ALTCHA_HMAC_KEY missing")
		return
	}

	token := makeToken()
	hash := signToken(token, secret)

	resp := altchaChallenge{
		Token:      token,
		Hash:       hash,
		ExpiresUTC: time.Now().Add(5 * time.Minute).UTC().Format(time.RFC3339),
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// POST /altcha/verify
func altchaVerifyHandler(w http.ResponseWriter, r *http.Request) {
	secret, err := hmacKey()
	if err != nil {
		http.Error(w, "server misconfigured", http.StatusInternalServerError)
		return
	}

	var req altchaVerifyRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, MaxRequestBodySize)).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	// Recompute HMAC over the token
	expected := signToken(req.Token, secret)
	ok := hmac.Equal([]byte(req.Hash), []byte(expected))

	// Also enforce expiry inside token
	if ok {
		_, exp, err := parseToken(req.Token)
		if err != nil || time.Now().After(exp) {
			ok = false
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if ok {
		_ = json.NewEncoder(w).Encode(altchaVerifyResponse{Ok: true})
		return
	}
	w.WriteHeader(http.StatusUnauthorized)
	_ = json.NewEncoder(w).Encode(altchaVerifyResponse{Ok: false})
}
