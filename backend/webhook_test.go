package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
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
	// Temporarily clear webhook URL
	originalURL := os.Getenv("TEAMS_WEBHOOK_URL")
	if err := os.Unsetenv("TEAMS_WEBHOOK_URL"); err != nil {
		t.Fatalf("Failed to unset env var: %v", err)
	}
	defer func() {
		if originalURL != "" {
			_ = os.Setenv("TEAMS_WEBHOOK_URL", originalURL)
		}
	}()

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

func TestHandleTeamsCommandReport(t *testing.T) {
	// Initialize analytics for testing
	analytics.IncrementInferences()
	analytics.IncrementInferences()
	analytics.IncrementPDFs()

	testCases := []struct {
		name        string
		requestBody string
		wantStatus  int
	}{
		{
			name: "report command",
			requestBody: `{
				"type": "message",
				"id": "test-id",
				"timestamp": "2025-11-05T12:00:00Z",
				"text": "report",
				"from": {"id": "user-1", "name": "Test User"},
				"conversation": {"id": "conv-1"}
			}`,
			wantStatus: 200,
		},
		{
			name: "analytics command",
			requestBody: `{
				"type": "message",
				"id": "test-id",
				"timestamp": "2025-11-05T12:00:00Z",
				"text": "analytics",
				"from": {"id": "user-1", "name": "Test User"},
				"conversation": {"id": "conv-1"}
			}`,
			wantStatus: 200,
		},
		{
			name: "stats command",
			requestBody: `{
				"type": "message",
				"id": "test-id",
				"timestamp": "2025-11-05T12:00:00Z",
				"text": "stats",
				"from": {"id": "user-1", "name": "Test User"},
				"conversation": {"id": "conv-1"}
			}`,
			wantStatus: 200,
		},
		{
			name: "unknown command",
			requestBody: `{
				"type": "message",
				"id": "test-id",
				"timestamp": "2025-11-05T12:00:00Z",
				"text": "help",
				"from": {"id": "user-1", "name": "Test User"},
				"conversation": {"id": "conv-1"}
			}`,
			wantStatus: 200,
		},
		{
			name:        "invalid JSON",
			requestBody: `{invalid json}`,
			wantStatus:  400,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/teams/command", strings.NewReader(tc.requestBody))
			w := httptest.NewRecorder()

			HandleTeamsCommand(w, req)

			resp := w.Result()

			if resp.StatusCode != tc.wantStatus {
				t.Errorf("Expected status %d, got %d", tc.wantStatus, resp.StatusCode)
			}

			if resp.StatusCode == 200 {
				var response TeamsOutgoingWebhookResponse
				if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
					t.Errorf("Failed to parse response: %v", err)
				}

				if response.Type != "message" {
					t.Errorf("Expected response type 'message', got '%s'", response.Type)
				}
			}
		})
	}
}

func TestCreateAnalyticsCard(t *testing.T) {
	stats := AnalyticsStats{
		InferencesRun: 100,
		PDFsGenerated: 50,
	}

	card := createAnalyticsCard(stats)

	if card.Type != "message" {
		t.Errorf("Expected type 'message', got '%s'", card.Type)
	}

	if len(card.Attachments) != 1 {
		t.Errorf("Expected 1 attachment, got %d", len(card.Attachments))
	}

	if card.Attachments[0].ContentType != "application/vnd.microsoft.card.adaptive" {
		t.Errorf("Expected adaptive card content type, got '%s'", card.Attachments[0].ContentType)
	}
}
