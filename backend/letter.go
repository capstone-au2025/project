package main

import (
	"bytes"
	"context"
	_ "embed"
	"log/slog"
	"os/exec"
	"strings"
	"text/template"
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

//go:embed input-template.txt
var inputTemplateContent string
var inputTemplate *template.Template

//go:embed letter-template.typst
var letterTemplate string

func init() {
	t, err := template.New("input-template.txt").Parse(inputTemplateContent)
	inputTemplate = t
	if err != nil {
		panic(err.Error())
	}
}

func RenderPdf(ctx context.Context, params LetterParams) ([]byte, error) {
	input_buf := &strings.Builder{}
	inputTemplate.Execute(input_buf, params)
	inputs := strings.Split(input_buf.String(), "\n")
	cmd := exec.Command("typst", inputs...)

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
