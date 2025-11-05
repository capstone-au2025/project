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
import type { ChangeEvent } from "react";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface EditPageProps {
  backPage: string;
  letterBody: string;
}
const EditPage: React.FC<EditPageProps> = ({
  backPage,
  letterBody,
  updateLetterBody,
}) => {
  const config = getConfig();

  return (
    <PageLayout>
      <div className="w-full max-w-2xl lg:rounded-lg lg:shadow-lg lg:border lg:border-sky py-8 px-4">
        <div className="flex flex-col items-center gap-4 lg:gap-8 lg:px-4 leading-none">
          <h2 className="text-2xl">{config.submittedPage.heading}</h2>
          <textarea
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                     const {value} = e.target;
              updateLetterBody(value);
                     console.log(letterBody);
            }}
            value={letterBody}
          >
          </textarea>
        </div>
      </div>
    </PageLayout>
  );
};

export default EditPage;
