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
	"time"

	_ "embed"
)

type Router struct {
	ip InferenceProvider
}

type PdfRequest struct {
	SenderName       string `json:"sender_name"`
	SenderAddress    string `json:"sender_address"`
	ReceiverName     string `json:"receiver_name"`
	ReceiverAddress  string `json:"receiver_address"`
	ComplaintSummary string `json:"complaint_summary"`
	Body             string `json:"body"`
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

type TextRequest struct {
	Message string `json:"message"`
}

type TextResponseSuccess struct {
	Status string `json:"status"`
	// The body of the letter
	Text string `json:"content"`
}

type TextResponseError struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

const (
	StatusSuccess = "success"
	StatusError   = "error"
)

// Given a message, get the body of a letter from LLM inference
func (rt *Router) text(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req TextRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(TextResponseError{Status: StatusError, Message: "failed to decode body"})
		slog.ErrorContext(r.Context(), "failed to decode body", "err", err)
		return
	}

	resp, err := rt.ip.Infer(r.Context(), req.Message)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TextResponseError{Status: StatusError, Message: "failed to run inference"})
		slog.ErrorContext(r.Context(), "failed to run inference", "err", err)
		return
	}
	json.NewEncoder(w).Encode(TextResponseSuccess{Status: StatusSuccess, Text: resp})
}

// Given an initial message, return a fully typeset and rendered PDF
func (rt *Router) pdf(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req PdfRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(PdfResponseError{Status: StatusError, Message: "failed to decode body"})
		slog.ErrorContext(r.Context(), "failed to decode body", "err", err)
		return
	}

	params := LetterParams{
		SenderName:       req.SenderName,
		SenderAddress:    req.SenderAddress,
		ReceiverName:     req.ReceiverName,
		ReceiverAddress:  req.ReceiverAddress,
		ComplaintSummary: req.ComplaintSummary,
		LetterContent:    req.Body,
		Date:             time.Now().Format("Mon, 02 Jan 2006"),
	}

	pdf, err := RenderPdf(r.Context(), params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(PdfResponseError{Status: StatusError, Message: "failed to generate pdf"})
		slog.ErrorContext(r.Context(), "failed to generate pdf", "err", err)
		return
	}

	pdfContent := base64.StdEncoding.EncodeToString(pdf)

	json.NewEncoder(w).Encode(PdfResponseSuccess{Status: StatusSuccess, PdfContent: pdfContent})
}

func healthcheck(w http.ResponseWriter, _ *http.Request) {
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
		ip: ip,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/render_pdf", rt.pdf)
	mux.HandleFunc("POST /api/generate_text", rt.text)
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
