package main

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	"github.com/openai/openai-go/packages/param"
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

	res, err := o.client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(systemPrompt + input),
		},
		Model:     o.modelId,
		MaxTokens: param.NewOpt(int64(o.maxOutputTokens))})

	if err != nil {
		return "", err
	}

	if res.Choices[0].Message.Refusal != "" {
		return "", fmt.Errorf("model refused for reason: %v", res.Choices[0].Message.Refusal)
	}

	return res.Choices[0].Message.Content, nil

}

func init() {
	inferenceProviders["openai"] = func(uint64, maxOutputTokens uint64) (InferenceProvider, error) {
		return NewOpenAI(int(maxOutputTokens))
	}
}
