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

type router struct {
	ip InferenceProvider
}

type pdfRequest struct {
	Message string `json:"message"`
}

type pdfResponseSuccess struct {
	Status string `json:"status"`
	// Base64 encoded content of a PDF file
	PdfContent string `json:"content"`
}

type PdfResponseError struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

const (
	statusSuccess = "success"
	statusError   = "error"
)

// Given an initial message, return a fully typeset and rendered PDF
func (rt *router) pdf(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req pdfRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(PdfResponseError{Status: statusError, Message: "failed to decode body"})
		slog.ErrorContext(r.Context(), "failed to decode body", "err", err)
		return
	}

	resp, err := rt.ip.Infer(r.Context(), req.Message)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(PdfResponseError{Status: statusError, Message: "failed to run inference"})
		slog.ErrorContext(r.Context(), "failed to run inference", "err", err)
		return
	}

	params := LetterParams{
		SenderName:       "Sender Name",
		SenderAddress:    "Sender Address",
		ReceiverName:     "Receiver Name",
		ReceiverAddress:  "Receiver Address",
		ComplaintSummary: "Notice of Rental Property Problems",
		LetterContent:    resp,
		Date:             "Date",
	}

	pdf, err := RenderPdf(r.Context(), params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(PdfResponseError{Status: statusError, Message: "failed to generate pdf"})
		slog.ErrorContext(r.Context(), "failed to generate pdf", "err", err)
		return
	}

	pdfContent := base64.StdEncoding.EncodeToString(pdf)

	_ = json.NewEncoder(w).Encode(pdfResponseSuccess{Status: statusSuccess, PdfContent: pdfContent})
}

func healthcheck(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	type Response struct {
		Status string `json:"status"`
	}
	response := Response{Status: "ok"}
	_ = json.NewEncoder(w).Encode(response)
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

	rt := router{
		ip: ip,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/pdf", rt.pdf)
	mux.HandleFunc("GET /healthz", healthcheck)

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
