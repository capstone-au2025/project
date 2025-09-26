package main

import (
	"context"
	"errors"
	"os"
	"testing"
)

func TestNewAWSMissingRegion(t *testing.T) {
	// Test missing AWS_REGION
	t.Setenv("AWS_BEDROCK_ROLE_ARN", "arn:aws:iam::123456789012:role/test-role")
	t.Setenv("AWS_BEDROCK_MODEL_ID", "test-model")
	// AWS_REGION is left unset

	aws, err := NewAWS()
	if err == nil {
		t.Fatal("expected error when AWS_REGION is missing")
	}
	if aws != nil {
		t.Fatal("expected nil AWS instance when AWS_REGION is missing")
	}

	if !errors.Is(err, ErrAWSRegionNotDefined) {
		t.Errorf("expected ErrAWSRegionNotDefined, got %v", err)
	}
}

func TestNewAWSMissingRoleArn(t *testing.T) {
	// Test missing AWS_BEDROCK_ROLE_ARN
	t.Setenv("AWS_REGION", "us-east-1")
	t.Setenv("AWS_BEDROCK_MODEL_ID", "test-model")
	// AWS_BEDROCK_ROLE_ARN is left unset

	aws, err := NewAWS()
	if err == nil {
		t.Fatal("expected error when AWS_BEDROCK_ROLE_ARN is missing")
	}
	if aws != nil {
		t.Fatal("expected nil AWS instance when AWS_BEDROCK_ROLE_ARN is missing")
	}

	if !errors.Is(err, ErrAWSRoleArnNotDefined) {
		t.Errorf("expected ErrAWSRoleArnNotDefined, got %v", err)
	}
}

func TestNewAWSMissingModelId(t *testing.T) {
	// Test missing AWS_BEDROCK_MODEL_ID
	t.Setenv("AWS_REGION", "us-east-1")
	t.Setenv("AWS_BEDROCK_ROLE_ARN", "arn:aws:iam::123456789012:role/test-role")
	// AWS_BEDROCK_MODEL_ID is left unset

	aws, err := NewAWS()
	if err == nil {
		t.Fatal("expected error when AWS_BEDROCK_MODEL_ID is missing")
	}
	if aws != nil {
		t.Fatal("expected nil AWS instance when AWS_BEDROCK_MODEL_ID is missing")
	}

	if !errors.Is(err, ErrAWSModelIdNotDefined) {
		t.Errorf("expected ErrAWSModelIdNotDefined, got %v", err)
	}
}

func TestNewAWSWithValidConfig(t *testing.T) {
	if os.Getenv("AWS_REGION") == "" ||
		os.Getenv("AWS_BEDROCK_ROLE_ARN") == "" ||
		os.Getenv("AWS_BEDROCK_MODEL_ID") == "" {
		t.Skip("AWS not configured")
	}

	aws, err := NewAWS()
	if err != nil {
		t.Skipf("AWS credentials not available: %v", err)
	}

	if aws.modelId != os.Getenv("AWS_BEDROCK_MODEL_ID") {
		t.Errorf("expected modelId to be %q, got %q", os.Getenv("AWS_BEDROCK_MODEL_ID"), aws.modelId)
	}
}

func TestAWSInfer(t *testing.T) {
	if os.Getenv("AWS_REGION") == "" ||
		os.Getenv("AWS_BEDROCK_ROLE_ARN") == "" ||
		os.Getenv("AWS_BEDROCK_MODEL_ID") == "" {
		t.Skip("AWS not configured")
	}

	aws, err := NewAWS()
	if err != nil {
		t.Skipf("AWS credentials not available: %v", err)
	}

	ctx := context.Background()
	input := "test input"

	result, err := aws.Infer(ctx, input)
	if err != nil {
		t.Skipf("AWS inference failed: %v", err)
	}

	if result == "" {
		t.Fatal("expected non-empty result")
	}
}
