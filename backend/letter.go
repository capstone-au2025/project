package main

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/json"
	"log/slog"
	"os/exec"
)

type LetterParams struct {
	SenderName       string `json:"sender_name"`
	SenderAddress    string `json:"sender_address"`
	SenderCity       string `json:"sender_city"`
	SenderState      string `json:"sender_state"`
	SenderZip        string `json:"sender_zip"`
	ReceiverName     string `json:"receiver_name"`
	ReceiverAddress  string `json:"receiver_address"`
	ReceiverCity     string `json:"receiver_city"`
	ReceiverState    string `json:"receiver_state"`
	ReceiverZip      string `json:"receiver_zip"`
	ComplaintSummary string `json:"complaint_summary"`
	LetterContent    string `json:"letter_content"`
	Date             string `json:"date"`
}

//go:embed letter-template.typst
var letterTemplate []byte

func RenderPdf(ctx context.Context, params LetterParams) ([]byte, error) {
	p, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}

	cmd := exec.CommandContext(ctx, "typst-wrapper", string(p))

	in, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	_, err = in.Write(letterTemplate)
	if err != nil {
		return nil, err
	}
	if err := in.Close(); err != nil {
		return nil, err
	}

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
