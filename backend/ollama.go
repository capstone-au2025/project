//go:build ollama

package main

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/ollama/ollama/api"
)

var (
	ErrOllamaModelIdNotDefined = errors.New("environment variable OLLAMA_MODEL_ID is not defined")
)

type Ollama struct {
	client  *api.Client
	modelId string
}

var _ InferenceProvider = (*Ollama)(nil)

func NewOllama() (*Ollama, error) {
	client, err := api.ClientFromEnvironment()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize ollama: %v", err)
	}

	modelId := os.Getenv("OLLAMA_MODEL_ID")
	if modelId == "" {
		return nil, ErrOllamaModelIdNotDefined
	}

	ctx := context.Background()

	err = client.Pull(ctx, &api.PullRequest{
		Model: modelId,
	}, func(api.ProgressResponse) error { return nil })
	if err != nil {
		return nil, fmt.Errorf("failed to pull model %s: %v", modelId, err)
	}

	return &Ollama{
		client:  client,
		modelId: modelId,
	}, nil
}

func (o *Ollama) Infer(ctx context.Context, input string) (string, error) {
	systemPrompt := RenderSystemPrompt()

	var message string
	err := o.client.Chat(ctx, &api.ChatRequest{
		Model: o.modelId,
		Messages: []api.Message{
			{
				Role:    "system",
				Content: systemPrompt,
			},
			{
				Role:    "user",
				Content: input,
			},
		},
		Stream: new(bool),
	}, func(resp api.ChatResponse) error {
		if resp.Done {
			message = resp.Message.Content
		}
		return nil
	})
	if err != nil {
		return "", fmt.Errorf("failed to chat with ollama: %v", err)
	}

	return message, nil
}

func init() {
	inferenceProviders["ollama"] = func(uint64, uint64) (InferenceProvider, error) {
		return NewOllama()
	}
}
