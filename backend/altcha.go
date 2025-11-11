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

var (
	challengeExpiration = 10 * time.Minute
	usedStore           = NewUsedChallengeStore(challengeExpiration)
	hmacKeyOnce         sync.Once
	maxUses             = 2
)

type usedStoreValue struct {
	expires time.Time
	uses    int
}

// used by /api/text to verify the altcha token and prevent replay attacks
type AltchaService struct {
	secret    string
	usedStore *UsedChallengeStore
}

func NewAltchaService() *AltchaService {
	return &AltchaService{
		secret:    "",
		usedStore: usedStore,
	}
}

func (a *AltchaService) Verify(key string) (bool, error) {
	if a.usedStore.IsUsed(key) {
		return false, nil
	}
	ok, err := altcha.VerifySolutionSafe(key, a.secret, true)
	if err != nil || !ok {
		return false, err
	}
	return ok, nil
}

type UsedChallengeStore struct {
	store    sync.Map
	lifetime time.Duration
	stop     chan struct{}
}

func NewUsedChallengeStore(lifetime time.Duration) *UsedChallengeStore {
	u := &UsedChallengeStore{
		lifetime: lifetime,
		stop:     make(chan struct{}),
	}
	go u.cleanupRoutine()
	return u
}

func (u *UsedChallengeStore) Stop() {
	close(u.stop)
}

func (u *UsedChallengeStore) Add(key string) {
	values := usedStoreValue{
		expires: time.Now().Add(u.lifetime),
		uses:    1,
	}
	u.store.Store(key, values)
}

func (u *UsedChallengeStore) IsUsed(key string) bool {
	valRaw, ok := u.store.Load(key)
	if !ok {
		u.Add(key)
		return false
	}
	val := valRaw.(usedStoreValue)

	if time.Now().After(val.expires) {
		return true
	}
	val.uses++
	if val.uses >= maxUses {
		u.store.Store(key, val)
		return true
	}
	
	return false // should never reach here
}

func (u *UsedChallengeStore) cleanupRoutine() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-u.stop:
			return
		case <-ticker.C:
			now := time.Now()
			u.store.Range(func(key, value any) bool {
				v := value.(usedStoreValue)
				if now.After(v.expires) {
					u.store.Delete(key)
				}
				return true
			})
		}
	}
}

func (a *AltchaService) getHMACKey() string {
	hmacKeyOnce.Do(func() {
		a.secret = os.Getenv("ALTCHA_HMAC_KEY")

		if a.secret == "" {
			a.secret = GenerateRandomString(32)
			slog.Info("Generated new HMAC key", "key", a.secret)
		}
	})
	return a.secret
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

func (a *AltchaService) altchaChallengeHandler(w http.ResponseWriter, r *http.Request) {
	secret := a.getHMACKey()

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

// Expects a JSON body with a "payload" field
func (a *AltchaService) altchaVerifyHandler(w http.ResponseWriter, r *http.Request) {
	secret := a.getHMACKey()

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var payload string

	var data struct {
		Payload string `json:"payload"`
	}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "failed to parse JSON body", http.StatusBadRequest)
		return
	}
	payload = data.Payload

	if payload == "" {
		http.Error(w, "Altcha payload missing", http.StatusBadRequest)
		return
	}
	key := makeHMACKey(payload, secret)

	if usedStore.IsUsed(key) {
		http.Error(w, "reused challenge", http.StatusForbidden)
		return
	}
	response, err := altcha.VerifySolutionSafe(payload, secret, true)
	if err != nil || !response {
		http.Error(w, "failed to verify challenge", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": response,
		"payload": payload,
	})
}

func makeHMACKey(data, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(data))
	return hex.EncodeToString(mac.Sum(nil))
}
