package main

import (
	"context"
	"os/exec"
	"testing"
)

func requireTypst(t *testing.T) string{
	t.Helper()
	path, err := exec.LookPath("typst")
	if err != nil {
		t.Skip("typst not found in PATH; skipping Typst rendering tests")
	}
	t.Logf("using typst at %s", path)
	return path
}

func TestRenderPdf_WithDirectiveLikeContent_DoesNotExecute(t *testing.T) {
	requireTypst(t)

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
			SenderName:       "Alice #set text(72pt)",
			SenderAddress:    `123 Fake St [#link("https://evil")[x]]`,
			ReceiverName:     "Bob #show: something",
			ReceiverAddress:  `456 Real Rd ] #set page(paper: "a0") [`,
			ComplaintSummary: `Notice: ` + payload,
			LetterContent:    `Body start: ` + payload + ` :Body end.`,
			Date:             `2025-09-30 #set text(200pt)`,
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

func TestRenderPdf_WithSpecialChars_QuotingAndEscaping(t *testing.T) {
	requireTypst(t)

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
}

func TestRenderPdf_LongInputs(t *testing.T) {
	requireTypst(t)

	ctx := context.Background()

	long := make([]byte, 200_000)
	for i := range long {
		long[i] = 'A'
	}

	params := LetterParams{
		SenderName:       string(long[:1000]),
		SenderAddress:    string(long[:5000]),
		ReceiverName:     string(long[:1000]),
		ReceiverAddress:  string(long[:5000]),
		ComplaintSummary: string(long[:10000]),
		LetterContent:    string(long),
		Date:             "2025-09-30",
	}

	pdf, err := RenderPdf(ctx, params)
	if err != nil {
		t.Fatalf("failed to render with long inputs: %v", err)
	}
	if len(pdf) == 0 {
		t.Fatalf("returned empty PDF for long input")
	}
}