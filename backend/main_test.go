package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/synctest"
)

func TestHealthcheck(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	w := httptest.NewRecorder()

	healthcheck(w, req)

	resp := w.Result()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected %d, got %d", http.StatusOK, resp.StatusCode)
	}
}

func TestPDFHandlerSuccess(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		r := router{ip: NewMockInferenceProvider()}

		reqBody := strings.NewReader(`{"message":"hello"}`)
		req := httptest.NewRequest(http.MethodPost, "/api/pdf", reqBody)
		w := httptest.NewRecorder()

		r.pdf(w, req)

		resp := w.Result()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected %d, got %d", http.StatusOK, resp.StatusCode)
		}

		var result pdfResponseSuccess
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			t.Fatalf("decode failed: %v", err)
		}

		if result.Status != statusSuccess {
			t.Errorf("expected %q, got %q", statusSuccess, result.Status)
		}
		if result.PdfContent == "" {
			t.Error("expected PdfContent to be filled")
		}

		// Verify the content is valid base64
		pdfBytes, err := base64.StdEncoding.DecodeString(result.PdfContent)
		if err != nil {
			t.Errorf("expected valid base64 content, got decode error: %v", err)
		}

		// Verify it starts with PDF magic bytes (%PDF-)
		if len(pdfBytes) < 5 || !bytes.HasPrefix(pdfBytes, []byte("%PDF-")) {
			t.Error("expected PDF content to start with PDF magic bytes (%PDF-)")
		}
	})
}

func TestPDFHandlerBadRequest(t *testing.T) {
	r := router{ip: NewMockInferenceProvider()}

	req := httptest.NewRequest(http.MethodPost, "/api/pdf", bytes.NewBufferString("not-json"))
	w := httptest.NewRecorder()

	r.pdf(w, req)

	resp := w.Result()

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d", http.StatusBadRequest, resp.StatusCode)
	}
}

func TestPDFHandlerInferenceError(t *testing.T) {
	t.Fatalf("mock fail")
	synctest.Test(t, func(t *testing.T) {
		mockProvider := NewMockInferenceProvider()
		mockProvider.shouldError = true
		r := router{ip: mockProvider}

		reqBody := strings.NewReader(`{"message":"hello"}`)
		req := httptest.NewRequest(http.MethodPost, "/api/pdf", reqBody)
		w := httptest.NewRecorder()

		r.pdf(w, req)

		resp := w.Result()

		if resp.StatusCode != http.StatusInternalServerError {
			t.Fatalf("expected %d, got %d", http.StatusInternalServerError, resp.StatusCode)
		}
	})
}
