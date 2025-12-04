package main

import (
	"context"
	"fmt"
	"log/slog"
)

// FallbackProvider tries multiple inference providers in order.
// If one fails, it automatically falls back to the next.
type FallbackProvider struct {
	providers []InferenceProvider
}

var _ InferenceProvider = (*FallbackProvider)(nil)

func NewFallbackProvider(providers ...InferenceProvider) *FallbackProvider {
	return &FallbackProvider{providers: providers}
}

func (f *FallbackProvider) Infer(ctx context.Context, input string) (string, error) {
	var lastErr error

	for i, p := range f.providers {
		resp, err := p.Infer(ctx, input)
		if err == nil {
			if i > 0 {
				slog.Warn("fallback provider used", "providerIndex", i)
			}
			return resp, nil
		}

		lastErr = err
		slog.Error("inference provider failed", "providerIndex", i, "err", err)
	}

	return "", fmt.Errorf("all inference providers failed, last error: %w", lastErr)
}
