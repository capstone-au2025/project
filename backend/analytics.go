package main

import (
	"sync"
)

type Analytics struct {
	mu            sync.RWMutex
	inferencesRun int64
	pdfsGenerated int64
}

var analytics = &Analytics{}

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
	}
}

type AnalyticsStats struct {
	InferencesRun int64 `json:"inferences_run"`
	PDFsGenerated int64 `json:"pdfs_generated"`
}
