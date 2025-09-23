package main

import (
	"context"
	"testing"
	"testing/synctest"
)

func TestMockInferenceProviderInfer(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		provider := NewMockInferenceProvider()

		ctx := context.Background()
		input := "test input"

		result, err := provider.Infer(ctx, input)

		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if result == "" {
			t.Fatal("expected non-empty result")
		}
	})
}

func TestRenderSystemPrompt(t *testing.T) {
	prompt := RenderSystemPrompt()

	if prompt == "" {
		t.Fatal("RenderSystemPrompt should not return empty string")
	}
}
