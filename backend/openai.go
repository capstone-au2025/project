//go:build openai

package main

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/packages/param"
	"github.com/openai/openai-go/v3/responses"
)

var (
	ErrOpenAiModelIdNotDefined = errors.New("environment variable OPENAI_MODEL_ID is not defined")
	ErrOpenAiApiKeyNotDefined  = errors.New("environment variable OPENAI_API_KEY is not defined")
	ErrOpenAiBaseUrlNotDefined = errors.New("environment variable OPENAI_BASE_URL is not defined")
)

type OpenAi struct {
	client          openai.Client
	modelId         string
	maxOutputTokens int
}

var _ InferenceProvider = (*OpenAi)(nil)

func NewOpenAI(maxOutputTokens int) (*OpenAi, error) {
	modelId := os.Getenv("OPENAI_MODEL_ID")
	if modelId == "" {
		return nil, ErrOpenAiModelIdNotDefined
	}

	apiKey := os.Getenv("OPENAI_API_KEY")
	if modelId == "" {
		return nil, ErrOpenAiApiKeyNotDefined
	}

	baseUrl := os.Getenv("OPENAI_BASE_URL")
	if modelId == "" {
		return nil, ErrOpenAiApiKeyNotDefined
	}

	client := openai.NewClient(option.WithAPIKey(apiKey), option.WithBaseURL(baseUrl))

	return &OpenAi{
		client:          client,
		modelId:         modelId,
		maxOutputTokens: maxOutputTokens,
	}, nil
}

func (o *OpenAi) Infer(ctx context.Context, input string) (string, error) {
	systemPrompt := RenderSystemPrompt()

	res, err := o.client.Responses.New(context.Background(), responses.ResponseNewParams{
		Instructions:    param.NewOpt(systemPrompt),
		MaxOutputTokens: param.NewOpt(int64(o.maxOutputTokens)),
		Model:           o.modelId,
	})
	if err != nil {
		return "", err
	}

	switch res.Output[0].Content[0].Type {
	case "output_text":
		return res.Output[0].Content[0].Text, nil
	default:
		return "", fmt.Errorf("model refused to produce output")
	}
}

func init() {
	inferenceProviders["openai"] = func(uint64, maxOutputTokens uint64) (InferenceProvider, error) {
		return NewOpenAI(int(maxOutputTokens))
	}
}
