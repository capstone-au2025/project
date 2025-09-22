package main

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/json"
	"log/slog"
	"os"
	"os/exec"
)

type LetterParams struct {
	SenderName       string `json:"sender_name"`
	SenderAddress    string `json:"sender_address"`
	ReceiverName     string `json:"receiver_name"`
	ReceiverAddress  string `json:"receiver_address"`
	ComplaintSummary string `json:"complaint_summary"`
	LetterContent    string `json:"letter_content"`
	Date             string `json:"date"`
}

//go:embed letter-template.typst
var letterTemplate string

func RenderPdf(ctx context.Context, params LetterParams) ([]byte, error) {
	p, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}
	cmd := exec.Command("typst", "compile", "-", "-", "--input=params="+string(p))

	in, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	_, err = in.Write([]byte(letterTemplate))
	if err != nil {
		return nil, err
	}
	in.Close()

	buf := bytes.Buffer{}
	cmd.Stdout = &buf

	errBuf := bytes.Buffer{}
	cmd.Stderr = &errBuf

	err = cmd.Run()
	if err != nil {
		slog.ErrorContext(ctx, "failed to run typst", "stderr", errBuf.String(), "err", err)
		return nil, err
	}

	return buf.Bytes(), nil
}

func main() {
	params := LetterParams{
		SenderName:       "Sender Name",
		SenderAddress:    "Sender Address",
		ReceiverName:     "Receiver Name",
		ReceiverAddress:  "Receiver Address",
		ComplaintSummary: "Complaint Summary",
		LetterContent:    "Letter Content\nLetter Content line 2",
		Date:             "Date",
	}
	pdf, err := RenderPdf(context.Background(), params)
	if err != nil {
		panic(err)
	}
	f, err := os.Create("out.pdf")
	f.Write(pdf)
	if err != nil {
		panic(err)
	}
}
