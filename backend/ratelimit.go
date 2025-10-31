package main

import (
	"context"
	"errors"
	"os"
	"strconv"

	"golang.org/x/time/rate"
)

var (
	ErrRateLimitExceeded = errors.New("rate limit exceeded")
)

// RateLimitedProvider wraps an InferenceProvider with rate limiting functionality.
type RateLimitedProvider struct {
	provider InferenceProvider
	limiter  *rate.Limiter
}

var _ InferenceProvider = (*RateLimitedProvider)(nil)

// NewRateLimitedProvider creates a new rate-limited inference provider that wraps
// an existing provider. Rate limit configuration is read from environment variables:
// - RATE_LIMIT_REQUESTS_PER_SECOND: Number of requests per second (default: 1)
// - RATE_LIMIT_BURST: Maximum burst size (default: 3)
func NewRateLimitedProvider(provider InferenceProvider) *RateLimitedProvider {
	requestsPerSecond := 1.0
	if val := os.Getenv("RATE_LIMIT_REQUESTS_PER_SECOND"); val != "" {
		if parsed, err := strconv.ParseFloat(val, 64); err == nil {
			requestsPerSecond = parsed
		}
	}

	burst := 3
	if val := os.Getenv("RATE_LIMIT_BURST"); val != "" {
		if parsed, err := strconv.Atoi(val); err == nil {
			burst = parsed
		}
	}

	return &RateLimitedProvider{
		provider: provider,
		limiter:  rate.NewLimiter(rate.Limit(requestsPerSecond), burst),
	}
}

// Infer implements the InferenceProvider interface with rate limiting.
func (r *RateLimitedProvider) Infer(ctx context.Context, input string) (string, error) {
	if !r.limiter.Allow() {
		return "", ErrRateLimitExceeded
	}

	return r.provider.Infer(ctx, input)
}
