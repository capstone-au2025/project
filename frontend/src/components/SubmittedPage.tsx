import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  base64ToUint8Array,
  sendMail,
  type NameAndAddress,
  type State,
} from "../certifiedmail";
import z from "zod";
import { GlobalWorkerOptions } from "pdfjs-dist";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useResizeDetector } from "react-resize-detector";
import { Document, Page } from "react-pdf";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PageLayout from "./PageLayout";
import { Link } from "wouter";
import { getConfig } from "../config/configLoader";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface SubmittedPageProps {
  formData: Record<string, string>;
  backPage: string;
}

type TextRequest = {
  message: string;
};

type PdfRequest = {
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  body: string;
};

const pdfResponseSchema = z.object({
  status: z.literal("success"),
  content: z.base64(),
});

const textResponseSchema = z.object({
  status: z.literal("success"),
  content: z.string(),
});

async function generatePdf(
  formData: Record<string, string>,
  sender: NameAndAddress,
  destination: NameAndAddress,
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

  const pdfResp = await fetch("/api/pdf", {
    method: "POST",
    body: JSON.stringify({
      senderName: sender.name,
      senderAddress: `${sender.address}, ${sender.city}, ${sender.state} ${sender.zip} `,
      receiverName: destination.name,
      receiverAddress: `${destination.address}, ${destination.city}, ${destination.state} ${destination.zip} `,
      body: text.content,
    } satisfies PdfRequest),
    headers: { "Content-Type": "application/json" },
  });
  const pdfJson = await pdfResp.json();
  return pdfResponseSchema.parse(pdfJson);
}

const SubmittedPage: React.FC<SubmittedPageProps> = ({
  formData,
  backPage,
}) => {
  const config = getConfig();

  const sender: NameAndAddress = {
    name: formData.senderName,
    company: formData.senderCompany,
    address: formData.senderAddress,
    city: formData.senderCity,
    state: (formData.senderState ?? "OH") as State,
    zip: formData.senderZip,
  };

  const destination: NameAndAddress = {
    name: formData.destinationName,
    company: formData.destinationCompany,
    address: formData.destinationAddress,
    city: formData.destinationCity,
    state: (formData.destinationState ?? "OH") as State,
    zip: formData.destinationZip,
  };

  const { data } = useQuery({
    queryKey: ["pdf", formData],
    staleTime: Infinity,
    queryFn: () => generatePdf(formData, sender, destination),
  });
  const {
    width: pdfWidth,
    height: pdfHeight,
    ref: pdfRef,
  } = useResizeDetector<HTMLDivElement>();

  const [pdfLoading, setPdfLoading] = useState(true);

  let pdf:
    | {
        bytes: Uint8Array;
        blobUrl: string;
        handleCertifiedMail: () => void;
      }
    | undefined = undefined;

  if (data) {
    const pdfBytes = base64ToUint8Array(data.content);
    // Use blob url because mobile safari absolutely refuses to open data urls
    const blobUrl = URL.createObjectURL(
      new Blob([pdfBytes as unknown as ArrayBuffer], {
        type: "application/pdf",
      }),
    );

    const handleCertifiedMail = () => {
      sendMail({
        sender,
        destination,
        duplex: false,
        letterName: "Letter",
        pdfBytes,
        pdfName: "Letter.pdf",
      });
    };

    pdf = { bytes: pdfBytes, blobUrl, handleCertifiedMail };
  }

  const loadingSkeleton = (
    <Skeleton width={pdfWidth} height={pdfHeight} className="absolute" />
  );

  return (
    <PageLayout>
      <div className="w-full max-w-5xl lg:rounded-lg lg:shadow-lg lg:border lg:border-sky py-8 px-4">
        <div className="flex flex-col items-center gap-4 lg:gap-8 lg:px-4 leading-none">
          <h2 className="text-2xl">{config.submittedPage.heading}</h2>
          <div
            ref={pdfRef}
            className="w-full max-w-[700px] aspect-[8.5/11] shadow-md border border-sky relative"
          >
            {pdf && (
              <a
                download="Letter.pdf"
                target="_blank"
                href={pdf.blobUrl}
                className="absolute w-full h-full"
              >
                <Document file={pdf.blobUrl} loading={loadingSkeleton}>
                  <Page
                    pageNumber={1}
                    width={pdfWidth}
                    renderTextLayer={false}
                    onLoadSuccess={() => setPdfLoading(false)}
                    loading={loadingSkeleton}
                  />
                </Document>
              </a>
            )}
            {pdfLoading && loadingSkeleton}
          </div>
          <div className="flex flex-col gap-2 self-stretch">
            {pdf ? (
              <button
                onClick={pdf.handleCertifiedMail}
                className="h-[56px] bg-primary text-white rounded-md font-bold text-sm sm:text-base hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase flex items-center justify-center"
              >
                {config.submittedPage.mailButton}
              </button>
            ) : (
              <Skeleton className="h-[56px] rounded-md" />
            )}
            {pdf ? (
              <a
                href={pdf.blobUrl}
                target="_blank"
                download={config.submittedPage.downloadFilename}
                className="h-[52px] box-border bg-white border-2 border-border rounded-md font-semibold hover:bg-white hover:border-border-hover transition-all duration-200 uppercase text-sm sm:text-base align-middle flex items-center justify-center"
              >
                {config.submittedPage.downloadButton}
              </a>
            ) : (
              <Skeleton className="h-[52px] box-border border-2 border-transparent rounded-md" />
            )}
            <Link
              href={backPage}
              className="py-3 bg-white border-2 border-border rounded-md font-semibold hover:bg-white hover:border-border-hover transition-all duration-200 uppercase text-sm sm:text-base align-middle flex items-center justify-center"
            >
              {config.submittedPage.backButton}
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SubmittedPage;
