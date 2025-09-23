package main

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials/stscreds"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime/types"
	"github.com/aws/aws-sdk-go-v2/service/sts"
)

// Error variables for AWS configuration validation
var (
	ErrAWSRegionNotDefined  = errors.New("environment variable AWS_REGION is not defined")
	ErrAWSRoleArnNotDefined = errors.New("environment variable AWS_BEDROCK_ROLE_ARN is not defined")
	ErrAWSModelIdNotDefined = errors.New("environment variable AWS_BEDROCK_MODEL_ID is not defined")
)

type AWS struct {
	brc     *bedrockruntime.Client
	modelId string
}

var _ InferenceProvider = (*AWS)(nil)

func NewAWS() (*AWS, error) {
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
		brc:     brc,
		modelId: bedrockModelId,
	}, nil
}

func (b *AWS) Infer(ctx context.Context, input string) (string, error) {
	systemPrompt := RenderSystemPrompt()

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
	})
	if err != nil {
		return "", fmt.Errorf("failed to converse with Bedrock: %v", err)
	}

	responseText, _ := response.Output.(*types.ConverseOutputMemberMessage)
	responseContentBlock := responseText.Value.Content[0]
	text, _ := responseContentBlock.(*types.ContentBlockMemberText)

	return text.Value, nil
}
