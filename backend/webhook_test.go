package main

import (
	"context"
	"os"
	"testing"
)

func TestSendAnalyticsToTeams(t *testing.T) {
	// Skip if webhook URL not set
	if os.Getenv("TEAMS_WEBHOOK_URL") == "" {
		t.Skip("TEAMS_WEBHOOK_URL not set, skipping webhook test")
	}

	ctx := context.Background()
	stats := AnalyticsStats{
		InferencesRun: 42,
		PDFsGenerated: 13,
	}

	err := SendAnalyticsToTeams(ctx, stats)
	if err != nil {
		t.Errorf("Failed to send analytics to Teams: %v", err)
	}
}

func TestSendAnalyticsToTeamsNoWebhookURL(t *testing.T) {
	// Clear webhook URL for this test
	t.Setenv("TEAMS_WEBHOOK_URL", "")

	ctx := context.Background()
	stats := AnalyticsStats{
		InferencesRun: 42,
		PDFsGenerated: 13,
	}

	err := SendAnalyticsToTeams(ctx, stats)
	if err == nil {
		t.Error("Expected error when TEAMS_WEBHOOK_URL is not set")
	}
}
