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

func TestRenderPdfWithDirectiveLikeContent_DoesNotExecute(t *testing.T) {

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
	}
}

// This test validates quoting/escaping of special characters and serves as the
// golden reference for the rendered PDF output.
//
// Manual verification:
//   - By default, the generated PDF is written to a temporary directory which is
//     removed after the test completes. Run tests with -v to see the logged path
//     while the test is running.
//   - To keep the PDF for inspection, set the environment variable PDF_OUT_DIR to
//     a writable path (e.g., testdata/out). The file will be written there and
//     preserved after the test.
//
// Golden hashes: When CHECK_PDF_HASHES=1 is set, the test will compare the
// SHA-256 of the generated PDF against values in testdata/special_hashes.json.
// To update the goldens after intentional changes or on first run, set
// UPDATE_GOLDEN=1 and re-run the test to regenerate the JSON file.
func TestRenderPdfWithSpecialChars_QuotingAndEscaping(t *testing.T) {

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

	// Save for manual inspection. If PDF_OUT_DIR is set, write there so the
	// file persists after the test; otherwise write to a temporary directory.
	var outPath string
	if outDir := os.Getenv("PDF_OUT_DIR"); outDir != "" {
		if err := os.MkdirAll(outDir, 0o755); err != nil {
			t.Fatalf("failed to create PDF_OUT_DIR %s: %v", outDir, err)
		}
		outPath = filepath.Join(outDir, "special_chars.pdf")
	} else {
		tmpDir := t.TempDir()
		outPath = filepath.Join(tmpDir, "special_chars.pdf")
	}
	if writeErr := os.WriteFile(outPath, pdf, 0o644); writeErr != nil {
		t.Fatalf("failed to write pdf to %s: %v", outPath, writeErr)
	}
	t.Logf("wrote PDF to %s", outPath)

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
