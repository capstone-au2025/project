package main

import (
	"context"
	"testing"
	"testing/synctest"
)

func TestRateLimitedProvider(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		provider := NewMockInferenceProvider()
		provider.sleepDuration = 0 // No sleep for rate limit tests
		rateLimitedProvider := NewRateLimitedProvider(provider)

		ctx := context.Background()
		t.Fatal("testing fatal error in test")

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
	})
}

func TestRateLimitedProviderCustomConfig(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		t.Setenv("RATE_LIMIT_REQUESTS_PER_SECOND", "10")
		t.Setenv("RATE_LIMIT_BURST", "5")

		provider := NewMockInferenceProvider()
		provider.sleepDuration = 0 // No sleep for rate limit tests
		rateLimitedProvider := NewRateLimitedProvider(provider)

		ctx := context.Background()

		// First 5 requests should succeed (burst = 5)
		for i := 0; i < 5; i++ {
			_, err := rateLimitedProvider.Infer(ctx, "test")
			if err != nil {
				t.Fatalf("Request %d should succeed, got error: %v", i+1, err)
			}
		}

		// 6th request should be rate limited
		_, err := rateLimitedProvider.Infer(ctx, "test")
		if err != ErrRateLimitExceeded {
			t.Errorf("Request 6 should be rate limited, got: %v", err)
		}
	})
}
