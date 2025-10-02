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

export const formPages: PageConfig[] = [
  {
    pageNumber: 1,
    title: "Tell Us About Your Concerns",
    subtitle: "Please provide details about your housing situation below",
    tipText:
      "Be as specific as possible. Include dates, locations, and any relevant documentation if available. Please do not Include any personal information in your answers.",
    tipType: "default",
    questions: [
      {
        name: "issue1",
        label: "What problems are occuring with your house/apartment?",
        placeholder:
          "Examples: no running water, no heat or A/C, lock is broken, etc",
        required: true,
      },
      {
        name: "issue2",
        label: "Where is each problem described happening?",
        placeholder: "Example: The bathroom sink is broken...",
      },
      {
        name: "issue3",
        label: "When did each problem start?",
        placeholder: "Provide the date or time that the problem started",
      },
      {
        name: "issue4",
        label: "Additional Information",
        placeholder: "Any other details you'd like your landlord to know...",
      },
    ],
    submitButtonText: "Continue",
    pageInfoText: "Page 1 of 3 - Let's get started!",
  },
  {
    pageNumber: 2,
    title: "Additional Details",
    subtitle: "Help us understand more about your situation",
    tipText:
      "Continue to be specific with dates, locations, and any relevant details. This information helps create a clear record of your concerns.",
    tipType: "default",
    questions: [
      {
        name: "issue5",
        label: "Have you notified your landlord about these issues before?",
        placeholder:
          "Example: Yes, I called on [date] and sent an email on [date]...",
        required: true,
      },
      {
        name: "issue6",
        label: "If yes, what was their response?",
        placeholder: "Example: They said they would send someone to fix it...",
      },
      {
        name: "issue7",
        label:
          "Are there any health or safety concerns related to these issues?",
        placeholder:
          "Example: The lack of heat is affecting my family's health...",
      },
      {
        name: "issue8",
        label: "Do you have any documentation? (photos, emails, texts)",
        placeholder:
          "Example: Yes, I have photos of the damage and email correspondence...",
      },
      {
        name: "issue9",
        label: "How have these issues affected your daily life?",
        placeholder:
          "Example: We can't cook meals or the cold is keeping us up at night...",
      },
    ],
    submitButtonText: "Continue",
    pageInfoText: "Page 2 of 3 - Almost there!",
  },
  {
    pageNumber: 3,
    title: "Final Question",
    subtitle: "One last thing before we generate your letter",
    tipText:
      "Almost done! This final question helps us understand your desired outcome so we can craft an effective communication.",
    tipType: "success",
    questions: [
      {
        name: "issue10",
        label: "What would you like to happen? What is your desired outcome?",
        placeholder:
          "Example: I would like the landlord to fix the heating system within the next week and provide temporary heating in the meantime...",
        required: true,
      },
    ],
    submitButtonText: "Generate Letter",
    pageInfoText: "Page 3 of 3 - Ready to submit!",
  },
];
