package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
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

func GetPdf(params LetterParams) ([]byte, error) {
	file, err := os.CreateTemp("tmp", "test*.json")
	if err != nil {
		return nil, err
	}

	j, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}
	file.Write(j)
	cmd := exec.Command("typst", "compile", "-", "-")

	t, err := template.ParseFiles("letter-template.typst")
	if err != nil {
		return nil, err
	}
	in, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	err = t.Execute(in, file.Name())
	if err != nil {
		return nil, err
	}
	in.Close()

	buf := bytes.Buffer{}
	cmd.Stdout = &buf

	err_buf := bytes.Buffer{}
	cmd.Stderr = &err_buf

	err = cmd.Run()
	if err != nil {
		fmt.Println("typst failed")
		fmt.Println(err_buf.String())
		return nil, err
	}

	if err != nil {
		return nil, err
	}

	file.Close()
	os.Remove(file.Name())

	return buf.Bytes(), nil
}

// Temporary code for testing until we have a proper test framework
// func main() {
// params := LetterParams{
// SenderName:       "Sender Name",
// SenderAddress:    "Sender Address",
// ReceiverName:     "Receiver Name",
// ReceiverAddress:  "Receiver Address",
// ComplaintSummary: "Complaint Summary",
// LetterContent:    "Letter Content",
// Date:             "Date",
// }
// pdf, err := GetPdf(params)
// if err != nil {
// panic(err)
// }
// f, err := os.Create("out.pdf")
// f.Write(pdf)
// if err != nil {
// panic(err)
// }
// }
