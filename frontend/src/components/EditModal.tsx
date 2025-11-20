import React from "react";
import { useState } from "react";
import type { RefObject, FormEvent } from "react";
import { getConfig } from "../config/configLoader";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import PageLayout from "./PageLayout";
import BackButton from "./BackButton";

interface EditPageProps {
  formData: Record<string, string>;
  backPage: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  /* textRef: RefObject<HTMLTextAreaElement | null>; */
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
  /* textRef, */
}) => {
  const [userLetter, setUserLetter] = useState<string>();

  const altchaPayload = formData.altchaPayload;
  const config = getConfig();

  const textQuery = useQuery({
    queryKey: ["text", formData],
    staleTime: Infinity,
    queryFn: () => generateText(formData, altchaPayload),
  });

  const letterBody: string = userLetter ?? textQuery.data?.content ?? "";

  return (
    <PageLayout>
      <div
        className={`w-full max-w-2xl bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-sky px-4 py-8 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-5`}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-primary text-center uppercase leading-tight">
            {config.submittedPage.editHeader}
          </h1>
          <p className="text-base sm:text-lg text-text-primary text-center">
            This may take a while.
          </p>
        </div>


        <form
          className="h-full flex flex-col gap-8 padding-8"
          onSubmit={onSubmit}
          method="dialog"
        >
          <textarea
            autoFocus
            onChange={(e) => {
              setUserLetter(e.target.value);
            }}
            rows={20}
            defaultValue={letterBody}
            className="h-full w-full min-h-[100px] p-3 sm:p-4 border-2 border-border rounded-md text-sm sm:text-base leading-relaxed font-secondary resize-y focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors duration-200 placeholder:text-text-muted hover:border-border-hover"
          ></textarea>

          <div className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <BackButton backPage={backPage} />
              <button
                type="submit"
                className="h-full flex-2 py-3 sm:py-4 px-6 sm:px-8 bg-primary text-white rounded-md font-bold text-base sm:text-lg hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase"
              >
                Save
              </button>
            </div>
          </div>

        </form>
      </div>
    </PageLayout>
  );
};

export default EditPage;
