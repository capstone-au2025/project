import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import { getConfig } from "../config/configLoader";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import z from "zod";
import PageLayout from "./PageLayout";
import BackButton from "./BackButton";
import LegalDisclaimer from "./LegalDisclaimer";

interface EditPageProps {
  formData: Record<string, string>;
  backPage: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  userLetter: string | undefined;
  animationDirection: string;
}

type TextRequest = {
  answers: Record<string, string>;
  altcha: string;
};

const textResponseSchema = z.object({
  status: z.literal("success"),
  content: z.string(),
});

async function generateText(
  formData: Record<string, string>,
  altchaPayload: string,
) {
  const textResponse = await fetch("/api/text", {
    method: "POST",
    body: JSON.stringify({
      answers: formData,
      altcha: altchaPayload,
    } satisfies TextRequest),
  });
  const textJson = await textResponse.json();
  const text = textResponseSchema.parse(textJson);
  return text;
}

const EditPage: React.FC<EditPageProps> = ({
  formData,
  backPage,
  onSubmit,
  userLetter,
  onChange,
  animationDirection,
}) => {
  const altchaPayload = formData.altchaPayload;
  const config = getConfig();

  const textQuery = useQuery({
    queryKey: ["text", formData],
    staleTime: Infinity,
    queryFn: () => generateText(formData, altchaPayload),
  });

  const letterBody: string = userLetter ?? textQuery.data?.content ?? "";

  const getAnimationName = () => {
    if (animationDirection == "normal") {
      return "animate-slide-in";
    } else if (animationDirection == "reverse") {
      return "animate-slide-out";
    }
    return "";
  };

  return (
    <PageLayout>
      <div
        className={`w-full max-w-2xl bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-sky px-4 py-8 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-5 ${getAnimationName()}`}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-primary text-center uppercase leading-tight">
            {letterBody == ""
              ? "Generating your letter"
              : config.submittedPage.editHeader}
          </h1>
          <p className="text-base sm:text-lg text-text-primary text-center">
            {letterBody == ""
              ? "This may take a while. In the meantime, feel free to review our legal disclaimers."
              : "Feel free to edit before continuing."}
          </p>
        </div>

        <LegalDisclaimer />

        <form
          className="h-full flex flex-col gap-8 padding-8"
          onSubmit={onSubmit}
          method="dialog"
        >
          {letterBody == "" ? (
            <Skeleton height="40ch" />
          ) : (
            <textarea
              autoFocus
              onChange={onChange}
              rows={20}
              defaultValue={letterBody}
              className="shake h-full w-full min-h-[100px] p-3 sm:p-4 border-2 border-border rounded-md text-sm sm:text-base leading-relaxed font-secondary resize-y focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors duration-200 placeholder:text-text-muted hover:border-border-hover"
            ></textarea>
          )}

          <div className="pt-4 sm:pt-6">
            <div className="flex flex-row flex-wrap gap-3 sm:gap-4">
              <BackButton backPage={backPage} />
              <button
                type="submit"
                className="h-full basis-md grow flex-2 py-3 sm:py-4 px-6 sm:px-8 bg-primary text-white rounded-md font-bold text-base sm:text-lg hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase"
              >
                Generate Letter
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default EditPage;
