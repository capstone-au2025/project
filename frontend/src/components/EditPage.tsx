import React, { RefObject, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import PageLayout from "./PageLayout";
import { Link } from "wouter";
import { getConfig } from "../config/configLoader";

interface EditPageProps {
  backPage: string;
  letterBody: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  updateLetterBody: (s: string) => void;
  ref: RefObject<HTMLDialogElement>;
}
const EditPage: React.FC<EditPageProps> = ({
  backPage,
  letterBody,
  updateLetterBody,
  onSubmit,
  ref,
}) => {
  const config = getConfig();

  const textRef = useRef<HTMLTextAreaElement>(null);

  return (
    <dialog ref={ref}>
      <div className="w-full max-w-2xl lg:rounded-lg lg:shadow-lg lg:border lg:border-sky py-8 px-4">
        <div className="flex flex-col items-center gap-4 lg:gap-8 lg:px-4 leading-none">
          <h2 className="text-2xl">{config.submittedPage.heading}</h2>
          <form
            method="dialog"
          >
          <textarea autofocus
            ref={textRef}
            value={letterBody}
            onChange={(e) => updateLetterBody(e.target.value)}
          >
          </textarea>
          <button
            type="submit"
            className="flex-1 py-3 sm:py-4 px-6 sm:px-8 bg-primary text-white rounded-md font-bold text-base sm:text-lg hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase"
            onClick={(e) => {e.preventDefault(); ref.current.close()}}
          >
            Save
          </button>
          </form>

        </div>
      </div>
    </dialog>
  );
};

export default EditPage;
