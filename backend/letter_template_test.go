package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func normalizePdf(pdf []byte) []byte {
	// Remove unstable metadata lines for stable hashing.
	// We filter common fields that vary per render:
	// - PDF Info dict keys: /CreationDate, /ModDate, /ID
	// - XMP metadata keys: xmp:CreateDate, xmp:ModifyDate, xmpMM:DocumentID, xmpMM:InstanceID
	// Note: This is a best-effort, line-based scrub; it's fine if the result isn't a valid PDF.
	lines := bytes.Split(pdf, []byte("\n"))
	out := make([][]byte, 0, len(lines))
	for _, l := range lines {
		if bytes.Contains(l, []byte("/CreationDate")) ||
			bytes.Contains(l, []byte("/ModDate")) ||
			bytes.Contains(l, []byte("/ID")) ||
			bytes.Contains(l, []byte("xmp:CreateDate")) ||
			bytes.Contains(l, []byte("xmp:ModifyDate")) ||
			bytes.Contains(l, []byte("xmpMM:DocumentID")) ||
			bytes.Contains(l, []byte("xmpMM:InstanceID")) {
			continue
		}
		out = append(out, l)
	}
	return bytes.Join(out, []byte("\n"))
}

// Compares normalized-PDF SHA-256 hashes against goldens in `backend/goldenPDFHashes/malicious_hashes.json`.
// Goldens were generated in Docker with:
//
//	docker build . -t backend -f Dockerfile.backend-dev && \
//	docker run --rm -e UPDATE_GOLDEN=1 -v $(pwd)/backend:/app backend go test -v
func TestRenderPdfWithDirectiveLikeContentDoesNotExecute(t *testing.T) {
	ctx := context.Background()

	malicious := []string{
		`#set text(1000pt)`,
		`#show: heading.with(numbering: "(X)")`,
		`#import "@preview/letterloom:1.0.0": *`,
		`#let x = 1 + 2`,
		`#panic("boom")`,
		`#("literal hash passthrough")`,
		`[#link("https://example.com")[click-me]]`,
		`] #set page(paper: "a0") [`,
		`#raw("<script>alert(1)</script>")`,
		`#eval(1+1)`,
		`#set page(margin: 1000pt)`,
		`${ not-typst }`,
		`#image("file:../../etc/passwd")`,
	}

	computed := make([]string, 0, len(malicious))

	for i, payload := range malicious {
		params := LetterParams{
			SenderName:       "Alice #set text(72pt) " + payload,
			SenderAddress:    `123 Fake St [#link("https://evil")[x]] ` + payload,
			ReceiverName:     "Bob #show: something " + payload,
			ReceiverAddress:  `456 Real Rd ] #set page(paper: "a0") [ ` + payload,
			ComplaintSummary: `Notice: ` + payload,
			LetterContent:    `Body start: ` + payload + ` :Body end.`,
			Date:             `2025-09-30 #set text(200pt) ` + payload,
		}

		pdf, err := RenderPdf(ctx, params)
		if err != nil {
			t.Fatalf("case %d failed to render: %v", i, err)
		}
		if len(pdf) == 0 {
			t.Fatalf("case %d returned empty PDF", i)
		}

		pdf = normalizePdf(pdf)

		h := sha256.Sum256(pdf)
		computed = append(computed, hex.EncodeToString(h[:]))
	}

	goldenPath := filepath.Join("goldenPDFHashes", "malicious_hashes.json")

	// Regenerate golden hashes when UPDATE_GOLDEN=1
	if os.Getenv("UPDATE_GOLDEN") == "1" {
		b, err := json.MarshalIndent(computed, "", "  ")
		if err != nil {
			t.Fatalf("failed to marshal golden hashes: %v", err)
		}

		if err := os.WriteFile(goldenPath, b, 0o644); err != nil {
			t.Fatalf("failed to write golden hashes to %s: %v", goldenPath, err)
		}

		t.Logf("updated golden hashes at %s", goldenPath)
		return
	}

	// --- Normal comparison ---
	goldenBytes, err := os.ReadFile(goldenPath)
	if err != nil {
		t.Fatalf("failed to read golden hashes from %s: %v (set UPDATE_GOLDEN=1 to generate)", goldenPath, err)
	}

	var expected []string
	if err := json.Unmarshal(goldenBytes, &expected); err != nil {
		t.Fatalf("failed to parse golden hashes JSON: %v", err)
	}

	if len(expected) != len(computed) {
		t.Fatalf("golden hash count mismatch: expected %d, got %d (set UPDATE_GOLDEN=1 to refresh)",
			len(expected), len(computed))
	}

	for i := range expected {
		if expected[i] != computed[i] {
			t.Fatalf("hash mismatch at case %d:\nexpected %s\ngot      %s",
				i, expected[i], computed[i])
		}
	}
}

// Compares normalized-PDF SHA-256 hash against goldens in `backend/goldenPDFHashes/special_hashes.json`.
// Goldens were generated in Docker with:
//
//	docker build . -t backend -f Dockerfile.backend-dev && \
//	docker run --rm -e UPDATE_GOLDEN=1 -v $(pwd)/backend:/app backend go test -v
func TestRenderPdfWithSpecialCharsQuotingAndEscaping(t *testing.T) {

	ctx := context.Background()

	params := LetterParams{
		SenderName:       `Alice "O'Connor" \ # { } [ ] ( ) < > &`,
		SenderAddress:    "123 \"Quote\" Lane\nApt #5\nCity, ST 12345",
		ReceiverName:     `Bob "The Builder"`,
		ReceiverAddress:  "456 'Apostrophe' Rd",
		ComplaintSummary: `Subject: <bold>& "weird" #stuff`,
		LetterContent:    "Hello,\n\nThis line has JSON-breaking chars: \" \\ / # [ ] { } < > &\n\nThanks,\nAlice",
		Date:             "2025-09-30",
	}

	pdf, err := RenderPdf(ctx, params)
	if err != nil {
		t.Fatalf("failed to render with special chars: %v", err)
	}
	if len(pdf) == 0 {
		t.Fatalf("returned empty PDF")
	}

	pdf = normalizePdf(pdf)

	// Compute hash for golden comparison
	h := sha256.Sum256(pdf)
	computed := []string{hex.EncodeToString(h[:])}

	// Optional golden comparison
	if os.Getenv("UPDATE_GOLDEN") == "1" {
		// Write or update testdata/special_hashes.json
		goldenPath := filepath.Join("goldenPDFHashes", "special_hashes.json")
		if err := os.MkdirAll("testdata", 0o755); err != nil {
			t.Fatalf("failed to create testdata directory: %v", err)
		}
		b, err := json.MarshalIndent(computed, "", "  ")
		if err != nil {
			t.Fatalf("failed to marshal golden hashes: %v", err)
		}
		t.Logf("computed hashes (copy into %s):\n%s", goldenPath, string(b))
		if err := os.WriteFile(goldenPath, b, 0o644); err != nil {
			t.Fatalf("failed to write golden hashes to %s: %v", goldenPath, err)
		}
		t.Logf("updated golden hashes at %s", goldenPath)
		return
	}

	goldenPath := filepath.Join("goldenPDFHashes", "special_hashes.json")
	goldenBytes, err := os.ReadFile(goldenPath)
	if err != nil {
		t.Fatalf("failed to read golden hashes from %s: %v (set UPDATE_GOLDEN=1 to generate)", goldenPath, err)
	}
	var expected []string
	if err := json.Unmarshal(goldenBytes, &expected); err != nil {
		t.Fatalf("failed to parse golden hashes JSON: %v", err)
	}
	if len(expected) != len(computed) {
		t.Fatalf("golden hash count mismatch: expected %d, got %d (set UPDATE_GOLDEN=1 to refresh)", len(expected), len(computed))
	}
	for i := range expected {
		if expected[i] != computed[i] {
			t.Fatalf("hash mismatch at case %d: expected %s, got %s", i, expected[i], computed[i])
		}
	}

}
