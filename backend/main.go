package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strings"
)

func hello(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	type Response struct {
		Message string `json:"message"`
	}
	response := Response{Message: "Hello, World!"}
	json.NewEncoder(w).Encode(response)
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/hello", hello)

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
