package main

import (
	"bytes"
	"context"
	"fmt"
	"text/template"
	"time"

	_ "embed"
)

type InferenceProvider interface {
	// Runs user context input through inference provider.
	// A system prompt may be included on creation of the inference provider.
	Infer(ctx context.Context, input string) (string, error)
}

type MockInferenceProvider struct {
	shouldError bool
}

var _ InferenceProvider = (*MockInferenceProvider)(nil)

func NewMockInferenceProvider() *MockInferenceProvider {
	return &MockInferenceProvider{}
}

func (m *MockInferenceProvider) Infer(ctx context.Context, input string) (string, error) {
	time.Sleep(2 * time.Second)
	if m.shouldError {
		return "", fmt.Errorf("mocked inference error")
	}
	return "MOCKED INFERENCE PROVIDER\n\n" + input + "\n\nMOCKED INFERENCE PROVIDER", nil
}

//go:embed prompt.txt
var systemPromptTemplateContent string
var systemPromptTemplate *template.Template

func init() {
	systemPromptTemplate = template.Must(template.New("prompt.txt").Parse(systemPromptTemplateContent))
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
