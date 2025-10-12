package main

import (
	"testing"
)

func TestAnalytics(t *testing.T) {
	// Reset analytics for clean test
	analytics = &Analytics{}

	// Test initial state
	stats := analytics.GetStats()
	if stats.InferencesRun != 0 {
		t.Errorf("expected 0 inferences, got %d", stats.InferencesRun)
	}
	if stats.PDFsGenerated != 0 {
		t.Errorf("expected 0 PDFs, got %d", stats.PDFsGenerated)
	}

	// Test increment
	analytics.IncrementInferences()
	analytics.IncrementPDFs()

	stats = analytics.GetStats()
	if stats.InferencesRun != 1 {
		t.Errorf("expected 1 inference, got %d", stats.InferencesRun)
	}
	if stats.PDFsGenerated != 1 {
		t.Errorf("expected 1 PDF, got %d", stats.PDFsGenerated)
	}
}
