import yaml from "js-yaml";
import appConfigRaw from "../../app-config.yaml?raw";

// TypeScript interfaces for config structure
export interface QuestionConfig {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

export interface PageConfig {
  pageNumber: number;
  title: string;
  subtitle: string;
  tipText: string;
  tipType: "default" | "success";
  questions: QuestionConfig[];
  submitButtonText: string;
  pageInfoText: string;
}

export interface FeatureCard {
  title: string;
  description: string;
}

export interface IntroPageConfig {
  heading: string;
  description: string;
  features: FeatureCard[];
  infoBox: {
    title: string;
    description: string;
  };
  getStartedButton: string;
  footerText: string;
}

export interface CommonConfig {
  pageLabel: string;
  backButton: string;
  tipPrefix: string;
  successTipPrefix: string;
  requiredIndicator: string;
}

export interface SubmittedPageConfig {
  heading: string;
  mailButton: string;
  downloadButton: string;
  backButton: string;
  downloadFilename: string;
  startAgainButton: string;
  certifiedMailConfirmation: {
    title: string;
    body: string;
    confirmButton: string;
    cancelButton: string;
  };
  startAgainConfirmation: {
    title: string;
    body: string;
    confirmButton: string;
    cancelButton: string;
  };
  editHeader: string;
}

export interface TermsOfServicePageConfig {
  heading: string;
  terms: string;
  continueButton: string;
}

export interface Disclaimer {
  heading: string;
  description: string;
}

export interface UIConfig {
  app: {
    title: string;
    legalDisclaimers: Disclaimer[];
  };
  introPage: IntroPageConfig;
  termsOfServicePage: TermsOfServicePageConfig;
  formPages: PageConfig[];
  common: CommonConfig;
  submittedPage: SubmittedPageConfig;
}

// Load and parse YAML config once on module import
async function loadConfig(): Promise<UIConfig> {
  try {
    const parsedConfig = yaml.load(appConfigRaw) as UIConfig;
    return parsedConfig;
  } catch (error) {
    console.error("Error loading UI config:", error);
    throw error;
  }
}

// Store config in module-level variable
let cachedConfig: UIConfig | null = null;

// Initialize config - this runs once when module is imported
const configPromise = loadConfig().then((loadedConfig) => {
  cachedConfig = loadedConfig;
  return loadedConfig;
});

// Synchronous getter that returns cached config (after initial load)
export function getConfig(): UIConfig {
  if (!cachedConfig) {
    throw new Error(
      "Config not yet loaded. Make sure to await the config initialization in your app.",
    );
  }
  return cachedConfig;
}

// For components that need to wait for config to load
export function getConfigPromise(): Promise<UIConfig> {
  return configPromise;
}

// Export the promise so App.tsx can wait for config to load
export const configReady = configPromise;
