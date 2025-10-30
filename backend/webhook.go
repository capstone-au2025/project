package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"
)

// TeamsWebhookMessage represents a Microsoft Teams adaptive card message
type TeamsWebhookMessage struct {
	Type        string                   `json:"type"`
	Attachments []TeamsWebhookAttachment `json:"attachments"`
}

type TeamsWebhookAttachment struct {
	ContentType string      `json:"contentType"`
	Content     interface{} `json:"content"`
}

type AdaptiveCard struct {
	Type    string        `json:"type"`
	Version string        `json:"version"`
	Body    []interface{} `json:"body"`
}

type TextBlock struct {
	Type   string `json:"type"`
	Text   string `json:"text"`
	Size   string `json:"size,omitempty"`
	Weight string `json:"weight,omitempty"`
	Wrap   bool   `json:"wrap,omitempty"`
}

type FactSet struct {
	Type  string `json:"type"`
	Facts []Fact `json:"facts"`
}

type Fact struct {
	Title string `json:"title"`
	Value string `json:"value"`
}

// SendAnalyticsToTeams sends current analytics data to Microsoft Teams webhook
func SendAnalyticsToTeams(ctx context.Context, stats AnalyticsStats) error {
	webhookURL := os.Getenv("TEAMS_WEBHOOK_URL")
	if webhookURL == "" {
		return fmt.Errorf("TEAMS_WEBHOOK_URL environment variable not set")
	}

	// Create adaptive card message
	message := TeamsWebhookMessage{
		Type: "message",
		Attachments: []TeamsWebhookAttachment{
			{
				ContentType: "application/vnd.microsoft.card.adaptive",
				Content: AdaptiveCard{
					Type:    "AdaptiveCard",
					Version: "1.4",
					Body: []interface{}{
						TextBlock{
							Type:   "TextBlock",
							Text:   "📊 Analytics Report",
							Size:   "Large",
							Weight: "Bolder",
							Wrap:   true,
						},
						TextBlock{
							Type: "TextBlock",
							Text: fmt.Sprintf("Report generated at %s", time.Now().Format("2006-01-02 15:04:05 MST")),
							Wrap: true,
						},
						FactSet{
							Type: "FactSet",
							Facts: []Fact{
								{
									Title: "Inferences Run",
									Value: fmt.Sprintf("%d", stats.InferencesRun),
								},
								{
									Title: "PDFs Generated",
									Value: fmt.Sprintf("%d", stats.PDFsGenerated),
								},
							},
						},
					},
				},
			},
		},
	}

	// Marshal to JSON
	jsonData, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal Teams message: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, "POST", webhookURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Send request
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send webhook: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("webhook returned status %d", resp.StatusCode)
	}

	slog.InfoContext(ctx, "Successfully sent analytics to Teams", "inferences", stats.InferencesRun, "pdfs", stats.PDFsGenerated)
	return nil
}

// StartAnalyticsWebhookScheduler starts a goroutine that periodically sends analytics to Teams
func StartAnalyticsWebhookScheduler(interval time.Duration) {
	if os.Getenv("TEAMS_WEBHOOK_URL") == "" {
		slog.Info("TEAMS_WEBHOOK_URL not set, analytics webhook scheduler disabled")
		return
	}

	slog.Info("Starting analytics webhook scheduler", "interval", interval)

	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for range ticker.C {
			ctx := context.Background()
			stats := analytics.GetStats()

			if err := SendAnalyticsToTeams(ctx, stats); err != nil {
				slog.ErrorContext(ctx, "Failed to send analytics to Teams", "err", err)
			}
		}
	}()
}
