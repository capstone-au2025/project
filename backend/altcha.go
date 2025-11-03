package main

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"sync"
	"time"

	altcha "github.com/altcha-org/altcha-lib-go"
)

var challengeExpiration = 10 * time.Minute
var usedStore = NewUsedChallengeStore(challengeExpiration)

// used by /api/text and /api/pdf to verify the altcha token and prevent replay attacks
type AltchaService struct {
	secret    string
	usedStore *UsedChallengeStore
}

func NewAltchaService() *AltchaService {
	return &AltchaService{
		secret:    getHMACKey(),
		usedStore: NewUsedChallengeStore(challengeExpiration),
	}
}

func (a *AltchaService) Verify(payload string) (bool, error) {
	if a.usedStore.IsUsed(payload) {
		return false, nil
	}
	ok, err := altcha.VerifySolutionSafe(payload, a.secret, true)
	if err != nil || !ok {
		return false, err
	}

	a.usedStore.Add(payload)
	return ok, nil
}

type UsedChallengeStore struct {
	store    sync.Map
	lifetime time.Duration
}

func NewUsedChallengeStore(lifetime time.Duration) *UsedChallengeStore {
	u := &UsedChallengeStore{lifetime: lifetime}
	go u.cleanupRoutine()
	return u
}

func (u *UsedChallengeStore) Add(key string) {
	expires := time.Now().Add(u.lifetime)
	u.store.Store(key, expires)
}

func (u *UsedChallengeStore) IsUsed(key string) bool {
	expires, ok := u.store.Load(key)
	if !ok {
		return false
	}
	exp := expires.(time.Time)
	if time.Now().After(exp) {
		u.store.Delete(key)
		return false
	}
	return true
}

func (u *UsedChallengeStore) cleanupRoutine() {
	for {
		time.Sleep(time.Minute)
		now := time.Now()
		u.store.Range(func(key, value any) bool {
			exp := value.(time.Time)
			if now.After(exp) {
				u.store.Delete(key)
			}
			return true
		})
	}
}

func getHMACKey() string {
	secret := os.Getenv("ALTCHA_HMAC_KEY")

	if secret == "" {
		secret = GenerateRandomString(32)
		slog.Info("Generated new HMAC key", "key", secret)
	}
	return secret
}

func GenerateRandomBytes(n int) []byte {
	b := make([]byte, n)
	_, err := rand.Read(b)

	if err != nil {
		slog.Error("Failed to generate random bytes", "err", err)
		return nil
	}
	return b
}

func GenerateRandomString(s int) string {
	b := GenerateRandomBytes(s)

	return base64.URLEncoding.EncodeToString(b)
}

func altchaChallengeHandler(w http.ResponseWriter, r *http.Request) {
	secret := getHMACKey()
	if secret == "" {
		http.Error(w, "server misconfigured", http.StatusInternalServerError)
		return
	}
	expires := time.Now().Add(challengeExpiration)

	response, err := altcha.CreateChallenge(altcha.ChallengeOptions{
		HMACKey: secret,
		Expires: &expires,
	})

	if err != nil {
		http.Error(w, "failed to generate challenge", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}

func altchaVerifyHandler(w http.ResponseWriter, r *http.Request) {
	secret := getHMACKey()
	if secret == "" {
		http.Error(w, "server misconfigured", http.StatusInternalServerError)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "failed to parse form", http.StatusInternalServerError)
		return
	}
	formData := r.Form.Get("altcha")
	if formData == "" {
		http.Error(w, "Altcha payload missing", http.StatusBadRequest)
		return
	}
	_ = json.NewDecoder(r.Body).Decode(&formData)
	key := makeHMACKey(formData, secret)

	if usedStore.IsUsed(key) {
		http.Error(w, "reused challenge", http.StatusForbidden)
		return
	}
	response, err := altcha.VerifySolutionSafe(formData, secret, true)
	if err != nil || !response {
		http.Error(w, "failed to verify challenge", http.StatusInternalServerError)
		return
	}

	usedStore.Add(key)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]bool{"verified": true})
}

func makeHMACKey(data, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(data))
	return hex.EncodeToString(mac.Sum(nil))
}
