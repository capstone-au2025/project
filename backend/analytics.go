package main

import (
	"sync"
	"time"
)

type Analytics struct {
	mu            sync.RWMutex
	inferencesRun int64
	pdfsGenerated int64
	StartedAt     time.Time
}

var analytics = &Analytics{
	StartedAt: time.Now(),
}

func (a *Analytics) IncrementInferences() {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.inferencesRun++
}

func (a *Analytics) IncrementPDFs() {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.pdfsGenerated++
}

func (a *Analytics) GetStats() AnalyticsStats {
	a.mu.RLock()
	defer a.mu.RUnlock()

	return AnalyticsStats{
		InferencesRun: a.inferencesRun,
		PDFsGenerated: a.pdfsGenerated,
		StartedAt:     a.StartedAt,
	}
}

type AnalyticsStats struct {
	InferencesRun int64 `json:"inferences_run"`
	PDFsGenerated int64 `json:"pdfs_generated"`
	StartedAt     time.Time `json:"started_at"`
}
