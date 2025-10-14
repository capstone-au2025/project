import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  base64ToUint8Array,
  sendMail,
  type NameAndAddress,
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

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface SubmittedPageProps {
  formData: Record<string, string>;
  onBack: () => void;
}

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

const SubmittedPage: React.FC<SubmittedPageProps> = ({ formData, onBack }) => {

  const destination: NameAndAddress = {
    address: "Destination Address",
    city: "Destination City",
    company: undefined,
    name: "Destination Name",
    state: "OH",
    zip: "12345",
  };

  const sender: NameAndAddress = {
    address: "Sender Address",
    city: "Sender City",
    company: undefined,
    name: "Sender Name",
    state: "OH",
    zip: "12345",
  };

  const { data } = useQuery({
    queryKey: ["pdf", formData],
    staleTime: Infinity,
    queryFn: () =>
      fetch("/api/pdf", {
        method: "POST",
        body: JSON.stringify({
          senderName: sender.name,
          senderAddress: `${sender.address}, ${sender.city}, ${sender.state} ${sender.zip}`,
          receiverName: destination.address,
          receiverAddress: `${destination.address}, ${destination.city}, ${destination.state} ${destination.zip}`,
          body: `body here ${JSON.stringify(formData)}`
        } satisfies PdfRequest),
        headers: { "Content-Type": "application/json" },
      })
        .then((resp) => resp.json())
        .then((json) => pdfResponseSchema.parse(json)),
  });
  const {
    width: pdfWidth,
    height: pdfHeight,
    ref: pdfRef,
  } = useResizeDetector<HTMLDivElement>();

  const [pdfLoading, setPdfLoading] = useState(true);

  let pdf:
    | {
      dataUrl: string;
      bytes: Uint8Array;
      blobUrl: string;
      handleCertifiedMail: () => void;
    }
    | undefined = undefined;

  if (data) {
    const dataUrl = `data:application/pdf;base64,${data.content}`;
    const bytes = base64ToUint8Array(data.content);
    // Use blob url because mobile safari absolutely refuses to open data urls
    const blobUrl = URL.createObjectURL(
      new Blob([bytes], { type: "application/pdf" }),
    );

    const handleCertifiedMail = () => {
      sendMail({
        sender,
        destination,
        duplex: false,
        letterName: "Letter",
        pdfBytes: base64ToUint8Array(data.content),
        pdfName: "Letter.pdf",
      });
    };

    pdf = { dataUrl, bytes, blobUrl, handleCertifiedMail };
  }

  const loadingSkeleton = (
    <Skeleton width={pdfWidth} height={pdfHeight} className="absolute" />
  );

  return (
    <PageLayout>
      <div className="w-full max-w-2xl lg:rounded-lg lg:shadow-lg lg:border lg:border-sky py-8 px-4">
        <div className="flex flex-col items-center gap-4 lg:gap-8 lg:px-4 leading-none">
          <h2 className="text-2xl">Here's your letter:</h2>
          <div
            ref={pdfRef}
            className="w-[300px] h-[387px] shadow-md border border-sky relative"
          >
            {pdf && (
              <a
                download="Letter.pdf"
                target="_blank"
                href={pdf.blobUrl}
                className="absolute"
              >
                <Document file={pdf.dataUrl} loading={loadingSkeleton}>
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
                Mail to your Landlord
              </button>
            ) : (
              <Skeleton className="h-[56px] rounded-md" />
            )}
            {pdf ? (
              <a
                href={pdf.blobUrl}
                target="_blank"
                download="Letter.pdf"
                className="h-[52px] box-border bg-white border-2 border-border rounded-md font-semibold hover:bg-white hover:border-border-hover transition-all duration-200 uppercase text-sm sm:text-base align-middle flex items-center justify-center"
              >
                Download PDF
              </a>
            ) : (
              <Skeleton className="h-[52px] box-border border-2 border-transparent rounded-md" />
            )}
            <button
              onClick={onBack}
              className="py-3 bg-white border-2 border-border rounded-md font-semibold hover:bg-white hover:border-border-hover transition-all duration-200 uppercase text-sm sm:text-base align-middle flex items-center justify-center"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SubmittedPage;
