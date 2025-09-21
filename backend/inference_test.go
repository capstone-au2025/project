package main

import (
	"context"
	"strings"
	"testing"
	"time"
)

func TestMockInferenceProvider_Infer(t *testing.T) {
	provider := NewMockInferenceProvider()

	ctx := context.Background()
	input := "test input"

	start := time.Now()
	result, err := provider.Infer(ctx, input)
	duration := time.Since(start)

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Check that it takes at least 2 seconds (with some tolerance)
	if duration < 1900*time.Millisecond {
		t.Errorf("expected at least 2 seconds delay, got %v", duration)
	}

	// Check that the response contains our input
	if !strings.Contains(result, input) {
		t.Errorf("expected result to contain input %q, got %q", input, result)
	}

	// Check that it has the mock prefix and suffix
	if !strings.Contains(result, "MOCKED INFERENCE PROVIDER") {
		t.Errorf("expected result to contain mock indicator, got %q", result)
	}
}

func TestMockInferenceProvider_Implements_Interface(t *testing.T) {
	// This test ensures MockInferenceProvider implements InferenceProvider
	var _ InferenceProvider = (*MockInferenceProvider)(nil)

	provider := NewMockInferenceProvider()
	if provider == nil {
		t.Fatal("NewMockInferenceProvider should not return nil")
	}
}

func TestRenderSystemPrompt(t *testing.T) {
	prompt := RenderSystemPrompt()

	if prompt == "" {
		t.Fatal("RenderSystemPrompt should not return empty string")
	}

	// Check that the current time is included in the prompt
	// We can't check for exact time, but we can check for reasonable time format
	if !strings.Contains(prompt, "2025") {
		t.Errorf("expected prompt to contain current year, got %q", prompt)
	}
}

func TestRenderSystemPrompt_Consistency(t *testing.T) {
	// Test that calling RenderSystemPrompt multiple times in quick succession
	// produces similar results (though time may differ slightly)
	prompt1 := RenderSystemPrompt()
	prompt2 := RenderSystemPrompt()

	if prompt1 == "" || prompt2 == "" {
		t.Fatal("RenderSystemPrompt should not return empty strings")
	}

	// The prompts should be similar in length (allowing for small time differences)
	if abs(len(prompt1)-len(prompt2)) > 10 {
		t.Errorf("prompts differ significantly in length: %d vs %d", len(prompt1), len(prompt2))
	}
}

// Helper function for absolute value
func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}
