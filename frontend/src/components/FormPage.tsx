import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import QuestionBox from "./QuestionBox";

export interface FormData {
  issue1: string;
  issue2: string;
  issue3: string;
  issue4: string;
}

interface FormPageProps {
  formData: FormData;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const FormPage: React.FC<FormPageProps> = ({
  formData,
  onInputChange,
  onSubmit,
}) => {

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "white",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Tell Us About Your Issues
      </h1>

      <form onSubmit={onSubmit}>
        {/* Repeat QuestionBox components */}
        <QuestionBox
          label="Briefly Describe your first issue:"
          name="issue1"
          value={formData.issue1}
          onChange={onInputChange}
          placeholder="Enter your first issue here..."
        />

        <QuestionBox
          label="Briefly Describe your second issue:"
          name="issue2"
          value={formData.issue2}
          onChange={onInputChange}
          placeholder="Enter your second issue here..."
        />

        <QuestionBox
          label="Briefly Describe your third issue:"
          name="issue3"
          value={formData.issue3}
          onChange={onInputChange}
          placeholder="Enter your third issue here..."
        />

        <QuestionBox
          label="Any additional concerns:"
          name="issue4"
          value={formData.issue4}
          onChange={onInputChange}
          placeholder="Enter any additional concerns..."
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#000",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default FormPage;
