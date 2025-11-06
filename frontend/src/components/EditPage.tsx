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
  modalRef: RefObject<HTMLDialogElement>;
  textRef: RefObject<HTMLTextAreaElement>;
}
const EditPage: React.FC<EditPageProps> = ({
  letterBody,
  onSubmit,
  modalRef,
  textRef,
}) => {
  const config = getConfig();

  return (
    <dialog
      ref={modalRef}
      className="absolute w-full m-auto backdrop-blur-md rounded-lg shadow-xl max-w-md w-full p-6 space-y-6"
    >
          <h2 className="text-2xl">{config.submittedPage.editHeader}</h2>
          <form
            className="flex flex-col gap-8 padding-8"
            onSubmit={onSubmit}
            method="dialog"
          >
          <textarea
            autoFocus
            ref={textRef}
            defaultValue={letterBody}
          >
          </textarea>
          <button
            type="submit"
            className="flex-1 py-3 sm:py-4 px-6 sm:px-8 bg-primary text-white rounded-md font-bold text-base sm:text-lg hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase"
          >
            Save
          </button>
          </form>
    </dialog>
  );
};

export default EditPage;
