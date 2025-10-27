//go:build aws

package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials/stscreds"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime/types"
	"github.com/aws/aws-sdk-go-v2/service/sts"
	"golang.org/x/time/rate"
)

// Error variables for AWS configuration validation
var (
	ErrAWSRegionNotDefined  = errors.New("environment variable AWS_REGION is not defined")
	ErrAWSRoleArnNotDefined = errors.New("environment variable AWS_BEDROCK_ROLE_ARN is not defined")
	ErrAWSModelIdNotDefined = errors.New("environment variable AWS_BEDROCK_MODEL_ID is not defined")
)

type AWS struct {
	brc             *bedrockruntime.Client
	modelId         string
	maxInputTokens  int
	maxOutputTokens *int32
	limiter         *rate.Limiter
}

var _ InferenceProvider = (*AWS)(nil)

func NewAWS(maxInputTokens, maxOutputTokens uint64) (*AWS, error) {
	region := os.Getenv("AWS_REGION")
	if region == "" {
		return nil, ErrAWSRegionNotDefined
	}

	bedrockRoleArn := os.Getenv("AWS_BEDROCK_ROLE_ARN")
	if bedrockRoleArn == "" {
		return nil, ErrAWSRoleArnNotDefined
	}

	bedrockModelId := os.Getenv("AWS_BEDROCK_MODEL_ID")
	if bedrockModelId == "" {
		return nil, ErrAWSModelIdNotDefined
	}

	ctx := context.Background()

	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(region))
	if err != nil {
		return nil, fmt.Errorf("failed to load default AWS config: %v", err)
	}

	stsClient := sts.NewFromConfig(cfg)
	assumeRoleProvider := stscreds.NewAssumeRoleProvider(stsClient, bedrockRoleArn)
	assumedCfg := cfg.Copy()
	assumedCfg.Credentials = aws.NewCredentialsCache(assumeRoleProvider)

	brc := bedrockruntime.NewFromConfig(assumedCfg)

	return &AWS{
		brc:             brc,
		modelId:         bedrockModelId,
		maxInputTokens:  int(maxInputTokens),
		maxOutputTokens: aws.Int32(int32(maxOutputTokens)),
		limiter:         rate.NewLimiter(1, 3), // 1 req/sec, burst 3
	}, nil
}

func init() {
	inferenceProviders["aws"] = func(maxInputTokens uint64, maxOutputTokens uint64) (InferenceProvider, error) {
		return NewAWS(maxInputTokens, maxOutputTokens)
	}
}

func (b *AWS) Infer(ctx context.Context, input string) (string, error) {
	if b.limiter != nil && !b.limiter.Allow() {
		return "", errors.New("rate limit exceeded")
	}

	systemPrompt := RenderSystemPrompt()

	// Bedrock does not expose an API to count the number of tokens that a particular model would
	// tokenize to. Therefore we have to be conservative by assuming each character in the user
	// input is one token. The system prompt however is trusted so we can use a simple heuristic
	estimatedSystemPromptTokens := len(systemPrompt) / 3
	if len(input)+estimatedSystemPromptTokens > b.maxInputTokens {
		return "", ErrTooManyInputTokens
	}

	response, err := b.brc.Converse(ctx, &bedrockruntime.ConverseInput{
		ModelId: aws.String(b.modelId),
		Messages: []types.Message{
			{
				Content: []types.ContentBlock{
					&types.ContentBlockMemberText{Value: input},
				},
				Role: "user",
			},
		},
		System: []types.SystemContentBlock{
			&types.SystemContentBlockMemberText{Value: systemPrompt},
		},
		InferenceConfig: &types.InferenceConfiguration{
			// The AWS inference provider never returns ErrTooOutputTokens. Instead, the Converse
			// api allows us to set the maximum number of output tokens. It will simply be
			// truncated if it is too long.
			MaxTokens: b.maxOutputTokens,
		},
	})
	if err != nil {
		return "", fmt.Errorf("failed to converse with Bedrock: %v", err)
	}

	slog.DebugContext(ctx, "AWS inference", "inputTokens", *response.Usage.InputTokens, "outputTokens", *response.Usage.OutputTokens)

	responseText, _ := response.Output.(*types.ConverseOutputMemberMessage)
	responseContentBlock := responseText.Value.Content[0]
	text, _ := responseContentBlock.(*types.ContentBlockMemberText)

	return text.Value, nil
}
