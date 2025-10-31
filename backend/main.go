package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	_ "embed"
)

type router struct {
	ip InferenceProvider
}

type PdfRequest struct {
	SenderName       string `json:"senderName"`
	SenderAddress    string `json:"senderAddress"`
	ReceiverName     string `json:"receiverName"`
	ReceiverAddress  string `json:"receiverAddress"`
	ComplaintSummary string `json:"complaintSummary"`
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
	statusSuccess = "success"
	statusError   = "error"
)

// Given a message, get the body of a letter from LLM inference
func (rt *router) text(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req TextRequest
	err := json.NewDecoder(http.MaxBytesReader(w, r.Body, MaxRequestBodySize)).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(TextResponseError{Status: statusError, Message: "failed to decode body"})
		slog.ErrorContext(r.Context(), "failed to decode body", "err", err)
		return
	}

	resp, err := rt.ip.Infer(r.Context(), req.Message)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(TextResponseError{Status: statusError, Message: "failed to run inference"})
		slog.ErrorContext(r.Context(), "failed to run inference", "err", err)
		return
	}

	// Track successful inference
	analytics.IncrementInferences()

	_ = json.NewEncoder(w).Encode(TextResponseSuccess{Status: statusSuccess, Text: resp})
}

// This should be set on any route which attempts to read the request body. Golang's net/http
// server does not set a maximum limit. We are only passing around small JSON so this can be small
const MaxRequestBodySize = 64 * 1024

// Golang's net/http server adds an extra 4096 bytes to this value as a buffer. The total buffer
// includes the request line, as well as all headers. The default value is 1MB which is clearly too
// large for the kinds of requests we need to handle
const MaxRequestHeaderSize = 8 * 1024

// Golang's net/http server has an infinite read/write timeout by default. We want to set it to a
// lower value to reduce load on the server
const ServerTimeout = 60 * time.Second

// Renders a pdf from the a `PdfRequest object`
func (rt *router) pdf(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req PdfRequest
	err := json.NewDecoder(http.MaxBytesReader(w, r.Body, MaxRequestBodySize)).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(TextResponseError{Status: statusError, Message: "failed to decode body"})
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
		_ = json.NewEncoder(w).Encode(PdfResponseError{Status: statusError, Message: "failed to generate pdf"})
		slog.ErrorContext(r.Context(), "failed to generate pdf", "err", err)
		return
	}

	// Track successful PDF generation
	analytics.IncrementPDFs()

	pdfContent := base64.StdEncoding.EncodeToString(pdf)

	_ = json.NewEncoder(w).Encode(PdfResponseSuccess{Status: statusSuccess, PdfContent: pdfContent})
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
	maxInputTokens := uint64(2000)
	if val := os.Getenv("MAX_INPUT_TOKENS"); val != "" {
		if parsed, err := strconv.ParseUint(val, 10, 0); err != nil {
			slog.Warn("Invalid MAX_INPUT_TOKENS. Using default value", "err", err)
		} else {
			maxInputTokens = parsed
		}
	} else {
		slog.Info("environment variable MAX_INPUT_TOKENS is not defined. Using default value")
	}

	maxOutputTokens := uint64(800)
	if val := os.Getenv("MAX_OUTPUT_TOKENS"); val != "" {
		if parsed, err := strconv.ParseUint(val, 10, 0); err != nil {
			slog.Warn("Invalid MAX_OUTPUT_TOKENS. Using default value", "err", err)
		} else {
			maxOutputTokens = parsed
		}
	} else {
		slog.Info("environment variable MAX_OUTPUT_TOKENS is not defined. Using default value")
	}

	slog.Info("Using configuration", "maxInputTokens", maxInputTokens, "maxOutputTokens", maxOutputTokens)

	ipNames := make([]string, 0, len(inferenceProviders))
	for ipName := range inferenceProviders {
		ipNames = append(ipNames, ipName)
	}
	slog.Info("Available inference providers", "values", ipNames)

	ipName := os.Getenv("INFERENCE_PROVIDER")
	if ipName == "" {
		ipName = "mock"
		slog.Warn("environment variable INFERENCE_PROVIDER is not defined. Using default value")
	}
	if inferenceProviders[ipName] == nil {
		slog.Error("Inference provider does not exist", "name", ipName)
		os.Exit(1)
	}

	slog.Info("Using inference provider", "name", ipName)

	ip, err := inferenceProviders[ipName](maxInputTokens, maxOutputTokens)
	if err != nil {
		slog.Error("Failed to initialize inference provider", "name", ipName, "err", err)
	}

	// Wrapped provider with rate limiting
	rateLimitedIP := NewRateLimitedProvider(ip)

	rt := router{
		ip: rateLimitedIP,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/pdf", rt.pdf)
	mux.HandleFunc("POST /api/text", rt.text)
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
	server := &http.Server{
		Handler:        mux,
		Addr:           ":3001",
		MaxHeaderBytes: MaxRequestHeaderSize,
		ReadTimeout:    ServerTimeout,
		WriteTimeout:   ServerTimeout,
	}
	log.Fatal(server.ListenAndServe())
}
