import React, { useState, useRef } from "react";
import type { FormEvent } from "react";
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
import { useLocation } from "wouter";
import EditModal from "./EditModal.tsx";
import { getConfig } from "../config/configLoader";
import BackButton from "./BackButton";

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
  altcha: string;
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
  text: string,
  sender: NameAndAddress,
  destination: NameAndAddress,
) {
  const pdfResp = await fetch("/api/pdf", {
    method: "POST",
    body: JSON.stringify({
      senderName: sender.name,
      senderAddress: `${sender.address}, ${sender.city}, ${sender.state} ${sender.zip} `,
      receiverName: destination.name,
      receiverAddress: `${destination.address}, ${destination.city}, ${destination.state} ${destination.zip} `,
      body: text,
    } satisfies PdfRequest),
    headers: { "Content-Type": "application/json" },
  });
  const pdfJson = await pdfResp.json();
  return pdfResponseSchema.parse(pdfJson);
}

async function generateText(
  formData: Record<string, string>,
  altchaPayload: string,
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
      altcha: altchaPayload,
    } satisfies TextRequest),
  });
  const textJson = await textResponse.json();
  const text = textResponseSchema.parse(textJson);
  return text;
}

const SubmittedPage: React.FC<SubmittedPageProps> = ({
  formData,
  backPage,
}) => {
  const config = getConfig();
  const altchaPayload = formData.altchaPayload;

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

  const {
    width: pdfWidth,
    height: pdfHeight,
    ref: pdfRef,
  } = useResizeDetector<HTMLDivElement>();

  const navigate = useLocation()[1];
  const [pdfLoading, setPdfLoading] = useState(true);
  const [userLetter, setUserLetter] = useState<string>();
  const [showModal, setShowModal] = useState(false);
  const [modalDetails, setModalDetails] = useState<{
    handleConfirm: () => void;
    header: string;
    body: string;
    confirmText: string;
    cancelText: string;
  } | null>(null);

  const textQuery = useQuery({
    queryKey: ["text", formData],
    staleTime: Infinity,
    queryFn: () => generateText(formData, altchaPayload),
  });

  const letterBody: string = userLetter ?? textQuery.data?.content ?? "";

  const { data } = useQuery({
    queryKey: ["pdf", letterBody],
    staleTime: Infinity,
    queryFn: () => generatePdf(letterBody, sender, destination),
    enabled: textQuery.isSuccess,
  });

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

    const handleCertifiedMailWithConfirm = () => {
      setModalDetails({
        handleConfirm: handleCertifiedMail,
        header: config.submittedPage.certifiedMailConfirmation.title,
        confirmText:
          config.submittedPage.certifiedMailConfirmation.confirmButton,
        body: config.submittedPage.certifiedMailConfirmation.body,
        cancelText: config.submittedPage.certifiedMailConfirmation.cancelButton,
      });
      setShowModal(true);
    };

    pdf = {
      bytes: pdfBytes,
      blobUrl,
      handleCertifiedMail: handleCertifiedMailWithConfirm,
    };
  }

  const loadingSkeleton = (
    <Skeleton width={pdfWidth} height={pdfHeight} className="absolute" />
  );

  /* Edit letter modal */
  const editModalRef = useRef<HTMLDialogElement>(null);
  const editTextRef = useRef<HTMLTextAreaElement>(null);
  const editModalSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editTextRef.current) {
      setUserLetter(editTextRef.current.value);
    }

    editModalRef.current?.close();
  };

  return (
    <PageLayout>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
            <h3 className="text-xl font-semibold text-text-primary">
              {modalDetails?.header}
            </h3>
            <p className="text-text-primary">{modalDetails?.body}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 sm:px-8 py-3 bg-white border-2 border-border rounded-md font-semibold hover:bg-white hover:border-border-hover transition-all duration-200 uppercase text-sm sm:text-base"
              >
                {modalDetails?.cancelText}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  modalDetails?.handleConfirm();
                }}
                className="flex-1 py-3 sm:py-4 px-6 sm:px-8 bg-primary text-white rounded-md font-bold text-base sm:text-lg hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase"
              >
                {modalDetails?.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
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
              <button
                onClick={() => editModalRef.current?.showModal()}
                className="h-[56px] bg-primary text-white rounded-md font-bold text-sm sm:text-base hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase flex items-center justify-center"
              >
                Edit
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
            <EditModal
              modalRef={editModalRef}
              textRef={editTextRef}
              letterBody={letterBody}
              onSubmit={editModalSubmit}
            />
            <BackButton backPage={backPage} />
            <button
              className="h-[52px] box-border bg-white border-2 border-border rounded-md font-semibold hover:bg-white hover:border-border-hover transition-all duration-200 uppercase text-sm sm:text-base align-middle flex items-center justify-center"
              onClick={() => {
                setModalDetails({
                  header: config.submittedPage.startAgainConfirmation.title,
                  confirmText:
                    config.submittedPage.startAgainConfirmation.confirmButton,
                  body: config.submittedPage.startAgainConfirmation.body,
                  cancelText:
                    config.submittedPage.startAgainConfirmation.cancelButton,
                  handleConfirm: () => navigate("/?reset=true"),
                });
                setShowModal(true);
              }}
            >
              {config.submittedPage.startAgainButton}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SubmittedPage;
