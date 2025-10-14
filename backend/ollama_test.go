//go:build ollama

package main

import (
	"context"
	"errors"
	"os"
	"testing"
)

func TestOllamaMissingModelId(t *testing.T) {
	if os.Getenv("OLLAMA_HOST") == "" {
		t.Skip("Ollama not configured")
	}

	t.Setenv("OLLAMA_MODEL_ID", "")

	ollama, err := NewOllama()
	if !errors.Is(err, ErrOllamaModelIdNotDefined) {
		t.Fatalf("Expected ErrOllamaModelIdNotDefined, got %v", err)
	}

	if ollama != nil {
		t.Fatal("Expected nil Ollama instance")
	}
}

func TestOllamaInfer(t *testing.T) {
	if os.Getenv("OLLAMA_HOST") == "" {
		t.Skip("Ollama not configured")
	}

	// This model is pretty small (292 MB) download: https://ollama.com/library/gemma3
	t.Setenv("OLLAMA_MODEL_ID", "gemma3:270m")

	ollama, err := NewOllama()
	if err != nil {
		t.Fatalf("Ollama failed to initialize: %v", err)
	}

	ctx := context.Background()
	input := "test input"

	result, err := ollama.Infer(ctx, input)
	if err != nil {
		t.Fatalf("Inference failed: %v", err)
	}

	if result == "" {
		t.Fatal("Expected non-empty result")
	}

	t.Logf("Result: %s", result)
}
