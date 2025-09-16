package main

import (
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"path/filepath"
	"strings"
)

type Router struct {
	ip InferenceProvider
}

func (rt *Router) hello(w http.ResponseWriter, r *http.Request) {
	question := "sink broke AGAIN. I'm don paying rent if it isn't fixed for real this time!"
	resp, err := rt.ip.Infer(r.Context(), question)
	if err != nil {
		http.Error(w, "failed to run inference", http.StatusInternalServerError)
		slog.ErrorContext(r.Context(), "failed to run inference", "err", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	type Response struct {
		Question string `json:"question"`
		Response string `json:"response"`
	}
	response := Response{Question: question, Response: resp}
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
	mux.HandleFunc("GET /api/hello", rt.hello)

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
