import React, { type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { STATES } from "../certifiedmail";
import PageLayout from "./PageLayout";

interface AddressInfoProps {
  type: "sender" | "destination";
  formData: Record<string, string>;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const AddressInfo: React.FC<AddressInfoProps> = ({
  type,
  formData,
  onChange,
}) => {
  const prefix = type == "sender" ? "Your" : "Landlord's";
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {prefix} Information
      </h3>

      <div>
        <label
          htmlFor={`${type}Name`}
          className="block text-sm font-medium text-text-primary mb-1"
        >
          {prefix} Name
          <span className="text-primary ml-1">*</span>
        </label>
        <input
          id={`${type}Name`}
          type="text"
          name={`${type}Name`}
          value={formData[`${type}Name`] ?? ""}
          onChange={onChange}
          placeholder={`${prefix} Name`}
          required
          className="w-full p-3 border-2 border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor={`${type}Company`}
          className="block text-sm font-medium text-text-primary mb-1"
        >
          {prefix} Company (optional)
        </label>
        <input
          id={`${type}Company`}
          type="text"
          name={`${type}Company`}
          value={formData[`${type}Company`] ?? ""}
          onChange={onChange}
          placeholder={`${prefix} Company`}
          className="w-full p-3 border-2 border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor={`${type}Address`}
          className="block text-sm font-medium text-text-primary mb-1"
        >
          {prefix} Address
          <span className="text-primary ml-1">*</span>
        </label>
        <input
          id={`${type}Address`}
          type="text"
          name={`${type}Address`}
          value={formData[`${type}Address`] ?? ""}
          onChange={onChange}
          placeholder={`${prefix} Address`}
          required
          className="w-full p-3 border-2 border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label
            htmlFor={`${type}City`}
            className="block text-sm font-medium text-text-primary mb-1"
          >
            {prefix} City
            <span className="text-primary ml-1">*</span>
          </label>
          <input
            id={`${type}City`}
            type="text"
            name={`${type}City`}
            value={formData[`${type}City`] ?? ""}
            onChange={onChange}
            placeholder={`${prefix} City`}
            required
            className="w-full p-3 border-2 border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor={`${type}State`}
            className="block text-sm font-medium text-text-primary mb-1"
          >
            {prefix} State
            <span className="text-primary ml-1">*</span>
          </label>
          <select
            id={`${type}State`}
            name={`${type}State`}
            value={formData[`${type}State`] ?? "OH"}
            onChange={onChange}
            required
            className="w-full p-3 border-2 border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors bg-white"
          >
            {Object.entries(STATES).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>
                {abbr} - {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`${type}Zip`}
            className="block text-sm font-medium text-text-primary mb-1"
          >
            {prefix} ZIP
            <span className="text-primary ml-1">*</span>
          </label>
          <input
            id={`${type}Zip`}
            type="text"
            name={`${type}Zip`}
            value={formData[`${type}Zip`] ?? ""}
            onChange={onChange}
            placeholder="12345"
            required
            inputMode="numeric"
            pattern="\d{5}(-\d{4})?"
            title="Please enter a 5-digit ZIP"
            maxLength={10}
            className="w-full p-3 border-2 border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

interface AddressPageProps {
  formData: Record<string, string>;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  backPage: string;
  animationDirection: string;
}

const AddressPage: React.FC<AddressPageProps> = ({
  formData,
  onInputChange,
  onSubmit,
  backPage,
  animationDirection,
}) => {
  const location = useLocation()[0];

  const getAnimationName = () => {
    if (animationDirection === "normal") return "animate-slide-in";
    if (animationDirection === "reverse") return "animate-slide-out";
    return "";
  };

  return (
    <PageLayout>
      <div
        id="addressPage"
        key={location}
        className={`w-full py-4 max-w-2xl bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-sky ${getAnimationName()}`}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-primary text-center uppercase leading-tight">
            Addresses
          </h1>
          <p className="text-base sm:text-lg text-text-primary text-center">
            Please enter your address and your landlord's address.
          </p>
        </div>

        <div className="mx-4 sm:mx-6 mb-4 sm:mb-6 border-l-4 p-3 sm:p-4 rounded-r-lg shadow-sm bg-white border-primary">
          <p className="text-xs sm:text-sm md:text-base text-text-primary">
            This information will not be stored, but will be passed to the
            certified mail service.
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-8 sm:space-y-10">
            <AddressInfo
              type="sender"
              formData={formData}
              onChange={onInputChange}
            />
            <AddressInfo
              type="destination"
              formData={formData}
              onChange={onInputChange}
            />

            <div className="pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href={backPage}
                  type="button"
                  className="px-6 sm:px-8 py-3 bg-white border-2 border-border rounded-md font-semibold hover:bg-white hover:border-border-hover transition-all duration-200 uppercase text-sm sm:text-base grid items-center"
                >
                  Back
                </Link>
                <button
                  type="submit"
                  className="flex-1 py-3 sm:py-4 px-6 sm:px-8 bg-primary text-white rounded-md font-bold text-base sm:text-lg hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg uppercase"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default AddressPage;
