package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os/exec"
	"sync"
	"testing"
	"testing/synctest"
	"time"

	altcha "github.com/altcha-org/altcha-lib-go"
)

// Helper function to create a valid altcha challenge and solution
func createValidAltcha(secret string) (string, error) {
	expires := time.Now().Add(10 * time.Minute)
	challenge, err := altcha.CreateChallenge(altcha.ChallengeOptions{
		HMACKey: secret,
		Expires: &expires,
	})
	if err != nil {
		return "", err
	}

	// Solve the challenge (using a done channel that stays open during solving)
	done := make(chan struct{})
	defer close(done)
	solution, err := altcha.SolveChallenge(challenge.Challenge, challenge.Salt, altcha.Algorithm(challenge.Algorithm), 0, 100000, done)
	if err != nil {
		return "", err
	}
	if solution == nil {
		return "", fmt.Errorf("failed to solve challenge: solution is nil")
	}

	// Create the payload
	payload := altcha.Payload{
		Algorithm: challenge.Algorithm,
		Challenge: challenge.Challenge,
		Number:    int64(solution.Number),
		Salt:      challenge.Salt,
		Signature: challenge.Signature,
	}

	// Encode the payload as JSON and then base64
	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(payloadJSON), nil
}

func TestHealthcheck(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	w := httptest.NewRecorder()

	healthcheck(w, req)

	resp := w.Result()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected %d, got %d", http.StatusOK, resp.StatusCode)
	}
}

func TestHMACKeyConsistency(t *testing.T) {
	// Reset the hmacKey to test generation
	hmacKey = ""
	hmacKeyOnce = sync.Once{}

	// Call getHMACKey multiple times
	key1 := getHMACKey()
	key2 := getHMACKey()
	key3 := getHMACKey()

	// Verify all keys are the same
	if key1 != key2 {
		t.Fatalf("key1 and key2 should be identical, got %s and %s", key1, key2)
	}
	if key2 != key3 {
		t.Fatalf("key2 and key3 should be identical, got %s and %s", key2, key3)
	}
	if key1 == "" {
		t.Fatal("key should not be empty")
	}
}

func TestPdfHandlerSuccess(t *testing.T) {
	// Skip test if typst-wrapper is not available
	if _, err := exec.LookPath("typst-wrapper"); err != nil {
		t.Skip("Skipping test: typst-wrapper not found in PATH")
	}

	synctest.Test(t, func(t *testing.T) {
		altchaService := NewAltchaService()
		defer altchaService.usedStore.Stop() // Stop cleanup goroutine after test

		r := router{
			ip:     NewMockInferenceProvider(),
			altcha: altchaService,
		}

		// Create a valid altcha token
		altchaToken, err := createValidAltcha(altchaService.secret)
		if err != nil {
			t.Fatalf("failed to create altcha token: %v", err)
		}

		reqJSON := map[string]string{
			"senderName":       "someone",
			"senderAddress":    "somewhere",
			"receiverName":     "someone else",
			"receiverAddress":  "somewhere else",
			"complaintSummary": "Something Has Gone Wrong",
			"body":             "Lorem ipsum dolor sit amet.",
			"altcha":           altchaToken,
		}
		reqBodyBytes, _ := json.Marshal(reqJSON)
		reqBody := bytes.NewReader(reqBodyBytes)
		req := httptest.NewRequest(http.MethodPost, "/api/pdf", reqBody)
		w := httptest.NewRecorder()

		r.pdf(w, req)

		resp := w.Result()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected %d, got %d", http.StatusOK, resp.StatusCode)
		}

		var result PdfResponseSuccess
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			t.Fatalf("decode failed: %v", err)
		}

		if result.Status != statusSuccess {
			t.Fatalf("expected %q, got %q", statusSuccess, result.Status)
		}

		// Verify the content is valid base64
		pdfBytes, err := base64.StdEncoding.DecodeString(result.PdfContent)
		if err != nil {
			t.Fatalf("expected valid base64 content, got decode error: %v", err)
		}

		// Verify it starts with PDF magic bytes (%PDF-)
		if len(pdfBytes) < 5 || !bytes.HasPrefix(pdfBytes, []byte("%PDF-")) {
			t.Fatal("expected PDF content to start with PDF magic bytes (%PDF-)")
		}
	})
}

func TestPDFHandlerBadRequest(t *testing.T) {
	r := router{
		ip:     NewMockInferenceProvider(),
		altcha: NewAltchaService(),
	}

	req := httptest.NewRequest(http.MethodPost, "/api/pdf", bytes.NewBufferString("not-json"))
	w := httptest.NewRecorder()

	r.pdf(w, req)

	resp := w.Result()

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, resp.StatusCode)
	}
}

func TestTextHandlerSuccess(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		altchaService := NewAltchaService()
		defer altchaService.usedStore.Stop() // Stop cleanup goroutine after test

		r := router{
			ip:     NewMockInferenceProvider(),
			altcha: altchaService,
		}

		// Create a valid altcha token
		altchaToken, err := createValidAltcha(altchaService.secret)
		if err != nil {
			t.Fatalf("failed to create altcha token: %v", err)
		}

		reqJSON := map[string]string{
			"message": "hello",
			"altcha":  altchaToken,
		}
		reqBodyBytes, _ := json.Marshal(reqJSON)
		reqBody := bytes.NewReader(reqBodyBytes)
		req := httptest.NewRequest(http.MethodPost, "/api/text", reqBody)
		w := httptest.NewRecorder()

		r.text(w, req)

		resp := w.Result()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected %d, got %d", http.StatusOK, resp.StatusCode)
		}

		var result PdfResponseSuccess
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			t.Fatalf("decode failed: %v", err)
		}

		if result.Status != statusSuccess {
			t.Fatalf("expected %q, got %q", statusSuccess, result.Status)
		}

	})
}

func TestTextHandlerBadRequest(t *testing.T) {
	r := router{
		ip:     NewMockInferenceProvider(),
		altcha: NewAltchaService(),
	}

	req := httptest.NewRequest(http.MethodPost, "/api/text", bytes.NewBufferString("not-json"))
	w := httptest.NewRecorder()

	r.text(w, req)

	resp := w.Result()

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, resp.StatusCode)
	}
}

func TestTextHandlerInferenceError(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		mockProvider := NewMockInferenceProvider()
		mockProvider.shouldError = true
		altchaService := NewAltchaService()
		defer altchaService.usedStore.Stop() // Stop cleanup goroutine after test

		r := router{
			ip:     mockProvider,
			altcha: altchaService,
		}

		// Create a valid altcha token
		altchaToken, err := createValidAltcha(altchaService.secret)
		if err != nil {
			t.Fatalf("failed to create altcha token: %v", err)
		}

		reqJSON := map[string]string{
			"message": "hello",
			"altcha":  altchaToken,
		}
		reqBodyBytes, _ := json.Marshal(reqJSON)
		reqBody := bytes.NewReader(reqBodyBytes)
		req := httptest.NewRequest(http.MethodPost, "/api/text", reqBody)
		w := httptest.NewRecorder()

		r.text(w, req)

		resp := w.Result()

		if resp.StatusCode != http.StatusInternalServerError {
			t.Fatalf("expected %d, got %d", http.StatusInternalServerError, resp.StatusCode)
		}
	})
}
