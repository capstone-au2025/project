package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"path/filepath"
	"strings"

	_ "embed"
)

type Router struct {
	Ip InferenceProvider
}

type PdfRequest struct {
	Message string `json:"message"`
}

type PdfResponseSuccess struct {
	Status string `json:"status"`
	// Base64 encoded content of a PDF file
	PdfContent string `json:"content"`
}

type PdfResponseError struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

const (
	StatusSuccess = "success"
	StatusError   = "error"
)

// TODO: replace with actual PDF generation
//
//go:embed example.pdf
var examplePdfContent []byte

// Given an initial message, return a fully typeset and rendered PDF
func (rt *Router) Pdf(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req PdfRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(PdfResponseError{Status: StatusError, Message: "failed to decode body"})
		slog.ErrorContext(r.Context(), "failed to decode body", "err", err)
		return
	}

	resp, err := rt.Ip.Infer(r.Context(), req.Message)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(PdfResponseError{Status: StatusError, Message: "failed to run inference"})
		slog.ErrorContext(r.Context(), "failed to run inference", "err", err)
		return
	}

	// TODO: replace with actual PDF generation
	slog.Info("Infer", "resp", resp)
	pdfContent := base64.StdEncoding.EncodeToString(examplePdfContent)

	json.NewEncoder(w).Encode(PdfResponseSuccess{Status: StatusSuccess, PdfContent: pdfContent})
}

func Healthcheck(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	type Response struct {
		Status string `json:"status"`
	}
	response := Response{Status: "ok"}
	json.NewEncoder(w).Encode(response)
}

func main() {
	var ip InferenceProvider

	aws, err := NewAWS()
	if err != nil {
		slog.Warn("AWS did not initialize. Falling back to mock provider")
		ip = NewMockInferenceProvider()
	} else {
		ip = aws
	}

	rt := Router{
		Ip: ip,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/pdf", rt.Pdf)
	mux.HandleFunc("GET /healthz", Healthcheck)

	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ext := filepath.Ext(r.URL.Path)

		// If there is no file extension, and it does not end with a slash,
		// assume it's an HTML file and append .html
		if ext == "" && !strings.HasSuffix(r.URL.Path, "/") {
			r.URL.Path += ".html"
		}

		http.FileServer(http.Dir("frontend")).ServeHTTP(w, r)
	}))

	fmt.Println("Listening on :3001")
	log.Fatal(http.ListenAndServe(":3001", mux))
}
