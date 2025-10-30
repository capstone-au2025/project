package main

import (
	"context"
	"testing"
)

// fastMockProvider is a mock that returns immediately without sleeping
type fastMockProvider struct{}

func (f *fastMockProvider) Infer(ctx context.Context, input string) (string, error) {
	return "mocked response", nil
}

func TestRateLimitedProvider(t *testing.T) {
	provider := &fastMockProvider{}
	rateLimitedProvider := NewRateLimitedProvider(provider)

	ctx := context.Background()

	// First 3 requests should succeed (burst = 3)
	for i := 0; i < 3; i++ {
		_, err := rateLimitedProvider.Infer(ctx, "test")
		if err != nil {
			t.Fatalf("Request %d should succeed, got error: %v", i+1, err)
		}
	}

	// 4th request should be rate limited
	_, err := rateLimitedProvider.Infer(ctx, "test")
	if err != ErrRateLimitExceeded {
		t.Errorf("Request 4 should be rate limited, got: %v", err)
	}
}

func TestRateLimitedProviderCustomConfig(t *testing.T) {
	t.Setenv("RATE_LIMIT_REQUESTS_PER_SECOND", "0.5")
	t.Setenv("RATE_LIMIT_BURST", "2")

	provider := &fastMockProvider{}
	rateLimitedProvider := NewRateLimitedProvider(provider)

	ctx := context.Background()

	// First 2 requests should succeed (burst = 2)
	for i := 0; i < 2; i++ {
		_, err := rateLimitedProvider.Infer(ctx, "test")
		if err != nil {
			t.Fatalf("Request %d should succeed, got error: %v", i+1, err)
		}
	}

	// 3rd request should be rate limited
	_, err := rateLimitedProvider.Infer(ctx, "test")
	if err != ErrRateLimitExceeded {
		t.Errorf("Request 3 should be rate limited, got: %v", err)
	}
}
