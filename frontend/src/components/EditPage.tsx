import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { GlobalWorkerOptions } from "pdfjs-dist";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-loading-skeleton/dist/skeleton.css";
import PageLayout from "./PageLayout";
import { Link } from "wouter";
import { getConfig } from "../config/configLoader";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface EditPageProps {
  formData: Record<string, string>;
  backPage: string;
}

type TextRequest = {
  message: string;
};

const textResponseSchema = z.object({
  status: z.literal("success"),
  content: z.string(),
});

async function generateText(
  formData: Record<string, string>,
) {
  let message = "";
  const config = getConfig();
  const keyToQuestion = Object.fromEntries(
    config.formPages.flatMap((x) => x.questions).map((x) => [x.name, x.label]),
  );
  for (const [key, value] of Object.entries(formData)) {
    const question = keyToQuestion[key];
    if (question) {
      message += `${question}\n${value}\n\n`;
    }
  }
  const textResponse = await fetch("/api/text", {
    method: "POST",
    body: JSON.stringify({
      message,
    } satisfies TextRequest),
  });
  const textJson = await textResponse.json();
  const text = textResponseSchema.parse(textJson);
  return text;
}

const EditPage: React.FC<EditPageProps> = ({
  formData,
  backPage,
}) => {
  const config = getConfig();

  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["text", formData],
    staleTime: Infinity,
    queryFn: () => generateText(formData),
  });


  if (isLoading) {
      return (<span>Loading...</span>)
  }

  if (isError) {
      return (<span>Error: {error.message}</span>)
  }

  let text: string = data.content;

  return (
    <PageLayout>
      <div className="w-full max-w-2xl lg:rounded-lg lg:shadow-lg lg:border lg:border-sky py-8 px-4">
        <div className="flex flex-col items-center gap-4 lg:gap-8 lg:px-4 leading-none">
          <h2 className="text-2xl">{config.submittedPage.heading}</h2>
          <textarea>
              {text}
          </textarea>
        </div>
      </div>
    </PageLayout>
  );
};

export default EditPage;
