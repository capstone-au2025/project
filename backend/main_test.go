package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// Fake provider for testing pdf handler
type FakeProvider struct {
	shouldError bool
}

func (f *FakeProvider) Infer(_ context.Context, input string) (string, error) {
	if f.shouldError {
		return "", fmt.Errorf("forced error")
	}
	return "FAKE: " + input, nil
}

func TestHealthcheck(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	w := httptest.NewRecorder()

	Healthcheck(w, req)

	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	var body map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("decode failed: %v", err)
	}

	if body["status"] != "ok" {
		t.Errorf("expected ok, got %q", body["status"])
	}
}

func TestPDFHandler_Success(t *testing.T) {
	router := Router{Ip: &FakeProvider{}}

	reqBody := strings.NewReader(`{"message":"hello"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/pdf", reqBody)
	w := httptest.NewRecorder()

	router.Pdf(w, req)

	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	var result PdfResponseSuccess
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatalf("decode failed: %v", err)
	}

	if result.Status != StatusSuccess {
		t.Errorf("expected success, got %q", result.Status)
	}
	if result.PdfContent == "" {
		t.Error("expected PdfContent to be filled")
	}
}

func TestPDFHandler_BadRequest(t *testing.T) {
	router := Router{Ip: &FakeProvider{}}

	req := httptest.NewRequest(http.MethodPost, "/api/pdf", bytes.NewBufferString("not-json"))
	w := httptest.NewRecorder()

	router.Pdf(w, req)

	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
}

func TestPDFHandler_InferenceError(t *testing.T) {
	router := Router{Ip: &FakeProvider{shouldError: true}}

	reqBody := strings.NewReader(`{"message":"hello"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/pdf", reqBody)
	w := httptest.NewRecorder()

	router.Pdf(w, req)

	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", resp.StatusCode)
	}
}
