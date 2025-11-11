package main

import (
	"bytes"
	"context"
	"errors"
	"os"
	"text/template"
	"time"

	_ "embed"
	_ "time/tzdata"

	"gopkg.in/yaml.v3"
)

// InferenceProvider defines the interface for any inference provider.
// Rate limiting is applied to all providers via the RateLimitedProvider wrapper
// in main.go. Configure rate limits using environment variables:
//   - RATE_LIMIT_REQUESTS_PER_SECOND: Number of requests per second (default: 1.0)
//   - RATE_LIMIT_BURST: Maximum burst size (default: 3)
type InferenceProvider interface {
	// Runs user context input through inference provider.
	// A system prompt may be included on creation of the inference provider.
	Infer(ctx context.Context, input string) (string, error)
}

var (
	ErrTooManyInputTokens  = errors.New("too many input tokens")
	ErrTooManyOutputTokens = errors.New("too many output tokens")
)

var inferenceProviders map[string]func(maxInputTokens uint64, maxOutputTokens uint64) (InferenceProvider, error) = make(map[string]func(uint64, uint64) (InferenceProvider, error))

type MockInferenceProvider struct {
	shouldError   bool
	sleepDuration time.Duration
}

var _ InferenceProvider = (*MockInferenceProvider)(nil)

func NewMockInferenceProvider() *MockInferenceProvider {
	return &MockInferenceProvider{
		sleepDuration: 2 * time.Second,
	}
}

func (m *MockInferenceProvider) Infer(ctx context.Context, input string) (string, error) {
	time.Sleep(m.sleepDuration)
	if m.shouldError {
		return "", ErrTooManyInputTokens
	}
	return "MOCKED INFERENCE PROVIDER\n\n" + input + "\n\nMOCKED INFERENCE PROVIDER", nil
}

func init() {
	inferenceProviders["mock"] = func(uint64, uint64) (InferenceProvider, error) {
		return NewMockInferenceProvider(), nil
	}
}

var systemPromptTemplate *template.Template
var userPromptTemplate *template.Template

var form Form

func init() {
	f, err := os.Open("app-config.yaml")
	if err != nil {
		panic(err)
	}
	d := yaml.NewDecoder(f)
	err = d.Decode(&form)
	if err != nil {
		panic(err)
	}
	systemPromptTemplate = template.Must(template.New("prompt.txt").Parse(form.Inference.SystemPrompt))
	userPromptTemplate = template.Must(template.New("user-prompt.txt").Parse(form.Inference.UserPrompt))
}

func RenderSystemPrompt() string {
	loc, _ := time.LoadLocation("America/New_York")
	now := time.Now().In(loc).Format("Monday, January 2 15:04:05 MST 2006")

	var buf bytes.Buffer
	err := systemPromptTemplate.Execute(&buf, map[any]any{
		"CurrentTime": now,
	})
	if err != nil {
		panic(err)
	}

	return buf.String()
}
