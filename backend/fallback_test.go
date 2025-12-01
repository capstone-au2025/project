package main

import (
	"context"
	"errors"
	"testing"
)

type staticProvider struct {
	resp  string
	err   error
	calls int
}

func (s *staticProvider) Infer(ctx context.Context, input string) (string, error) {
	s.calls++
	return s.resp, s.err
}

func TestFallbackProviderSucceedsOnSecond(t *testing.T) {
	first := &staticProvider{err: errors.New("first failed")}
	second := &staticProvider{resp: "ok"}

	fp := NewFallbackProvider(first, second)

	resp, err := fp.Infer(context.Background(), "input")
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}
	if resp != "ok" {
		t.Fatalf("expected %q, got %q", "ok", resp)
	}
	if first.calls != 1 {
		t.Fatalf("expected first provider to be called once, got %d", first.calls)
	}
	if second.calls != 1 {
		t.Fatalf("expected second provider to be called once, got %d", second.calls)
	}
}

func TestFallbackProviderAllFail(t *testing.T) {
	first := &staticProvider{err: errors.New("first failed")}
	second := &staticProvider{err: errors.New("second failed")}

	fp := NewFallbackProvider(first, second)

	_, err := fp.Infer(context.Background(), "input")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if first.calls != 1 {
		t.Fatalf("expected first provider to be called once, got %d", first.calls)
	}
	if second.calls != 1 {
		t.Fatalf("expected second provider to be called once, got %d", second.calls)
	}
}


