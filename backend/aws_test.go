package main

import (
	"os"
	"testing"
)

func TestNewAWS_MissingRegion(t *testing.T) {
	// Save original env vars
	originalRegion := os.Getenv("AWS_REGION")
	originalRoleArn := os.Getenv("AWS_BEDROCK_ROLE_ARN")
	originalModelId := os.Getenv("AWS_BEDROCK_MODEL_ID")

	// Clean up after test
	defer func() {
		os.Setenv("AWS_REGION", originalRegion)
		os.Setenv("AWS_BEDROCK_ROLE_ARN", originalRoleArn)
		os.Setenv("AWS_BEDROCK_MODEL_ID", originalModelId)
	}()

	// Test missing AWS_REGION
	os.Unsetenv("AWS_REGION")
	os.Setenv("AWS_BEDROCK_ROLE_ARN", "arn:aws:iam::123456789012:role/test-role")
	os.Setenv("AWS_BEDROCK_MODEL_ID", "test-model")

	aws, err := NewAWS()
	if err == nil {
		t.Fatal("expected error when AWS_REGION is missing")
	}
	if aws != nil {
		t.Fatal("expected nil AWS instance when AWS_REGION is missing")
	}

	expectedError := "environment variable AWS_REGION is not defined"
	if err.Error() != expectedError {
		t.Errorf("expected error %q, got %q", expectedError, err.Error())
	}
}

func TestNewAWS_MissingRoleArn(t *testing.T) {
	// Save original env vars
	originalRegion := os.Getenv("AWS_REGION")
	originalRoleArn := os.Getenv("AWS_BEDROCK_ROLE_ARN")
	originalModelId := os.Getenv("AWS_BEDROCK_MODEL_ID")

	// Clean up after test
	defer func() {
		os.Setenv("AWS_REGION", originalRegion)
		os.Setenv("AWS_BEDROCK_ROLE_ARN", originalRoleArn)
		os.Setenv("AWS_BEDROCK_MODEL_ID", originalModelId)
	}()

	// Test missing AWS_BEDROCK_ROLE_ARN
	os.Setenv("AWS_REGION", "us-east-1")
	os.Unsetenv("AWS_BEDROCK_ROLE_ARN")
	os.Setenv("AWS_BEDROCK_MODEL_ID", "test-model")

	aws, err := NewAWS()
	if err == nil {
		t.Fatal("expected error when AWS_BEDROCK_ROLE_ARN is missing")
	}
	if aws != nil {
		t.Fatal("expected nil AWS instance when AWS_BEDROCK_ROLE_ARN is missing")
	}

	expectedError := "environment variable AWS_BEDROCK_ROLE_ARN is not defined"
	if err.Error() != expectedError {
		t.Errorf("expected error %q, got %q", expectedError, err.Error())
	}
}

func TestNewAWS_MissingModelId(t *testing.T) {
	// Save original env vars
	originalRegion := os.Getenv("AWS_REGION")
	originalRoleArn := os.Getenv("AWS_BEDROCK_ROLE_ARN")
	originalModelId := os.Getenv("AWS_BEDROCK_MODEL_ID")

	// Clean up after test
	defer func() {
		os.Setenv("AWS_REGION", originalRegion)
		os.Setenv("AWS_BEDROCK_ROLE_ARN", originalRoleArn)
		os.Setenv("AWS_BEDROCK_MODEL_ID", originalModelId)
	}()

	// Test missing AWS_BEDROCK_MODEL_ID
	os.Setenv("AWS_REGION", "us-east-1")
	os.Setenv("AWS_BEDROCK_ROLE_ARN", "arn:aws:iam::123456789012:role/test-role")
	os.Unsetenv("AWS_BEDROCK_MODEL_ID")

	aws, err := NewAWS()
	if err == nil {
		t.Fatal("expected error when AWS_BEDROCK_MODEL_ID is missing")
	}
	if aws != nil {
		t.Fatal("expected nil AWS instance when AWS_BEDROCK_MODEL_ID is missing")
	}

	expectedError := "environment variable AWS_BEDROCK_MODEL_ID is not defined"
	if err.Error() != expectedError {
		t.Errorf("expected error %q, got %q", expectedError, err.Error())
	}
}

func TestAWS_Implements_Interface(t *testing.T) {
	// This test ensures AWS implements InferenceProvider
	var _ InferenceProvider = (*AWS)(nil)
}

// Note: Testing the actual AWS.Infer method would require real AWS credentials
// and would make actual API calls, which is not suitable for unit tests.
// For integration tests, you could create a separate test file with build tags
// that tests against real AWS services in a controlled environment.

func TestNewAWS_AllEnvVarsSet_Structure(t *testing.T) {
	// Save original env vars
	originalRegion := os.Getenv("AWS_REGION")
	originalRoleArn := os.Getenv("AWS_BEDROCK_ROLE_ARN")
	originalModelId := os.Getenv("AWS_BEDROCK_MODEL_ID")

	// Clean up after test
	defer func() {
		os.Setenv("AWS_REGION", originalRegion)
		os.Setenv("AWS_BEDROCK_ROLE_ARN", originalRoleArn)
		os.Setenv("AWS_BEDROCK_MODEL_ID", originalModelId)
	}()

	// Set all required environment variables
	os.Setenv("AWS_REGION", "us-east-1")
	os.Setenv("AWS_BEDROCK_ROLE_ARN", "arn:aws:iam::123456789012:role/test-role")
	os.Setenv("AWS_BEDROCK_MODEL_ID", "test-model")

	// This test will likely fail in CI/local environment without proper AWS setup
	// but it tests the environment variable validation logic
	aws, err := NewAWS()

	// We expect this to fail due to AWS credentials/config issues in test environment
	// but NOT due to missing environment variables
	if err != nil {
		// Verify it's not an environment variable error
		if err.Error() == "environment variable AWS_REGION is not defined" ||
			err.Error() == "environment variable AWS_BEDROCK_ROLE_ARN is not defined" ||
			err.Error() == "environment variable AWS_BEDROCK_MODEL_ID is not defined" {
			t.Fatalf("environment variable validation failed: %v", err)
		}
		// Expected to fail due to AWS config issues in test environment
		t.Logf("Expected AWS config error in test environment: %v", err)
		return
	}

	// If we somehow get here (proper AWS setup), verify the structure
	if aws == nil {
		t.Fatal("expected non-nil AWS instance when all env vars are set")
	}

	if aws.modelId != "test-model" {
		t.Errorf("expected modelId to be 'test-model', got %q", aws.modelId)
	}
}
