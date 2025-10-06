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
        name: "mainProblem",
        label: "What problems are occuring with your house/apartment?",
        placeholder:
          "Examples: no running water, no heat or A/C, lock is broken, etc",
        required: true,
      },
      {
        name: "problemLocations",
        label: "Where is each problem described happening?",
        placeholder: "Example: The bathroom sink is broken...",
      },
      {
        name: "startOfProblem",
        label: "When did each problem start?",
        placeholder: "Provide the date or time that the problem started",
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
        name: "problemAffect",
        label: "How are these problems affecting your living situation?",
        placeholder:
          "Example: I can't take a shower, I feel unsafe, the apartment is too cold for my kids, etc. ",
        required: true,
      },
      {
        name: "whatTheyTried",
        label:
          "Have you informed your landlord about these problems and have they replied?",
        placeholder:
          "Please include details about communications and replies from your landlord...",
      },
      {
        name: "solutionToProblem",
        label: "What would you like your landlord to do to fix these problems?",
        placeholder:
          "Provide details about what your landlord can do to fix this problem...",
      },
      {
        name: "solutionDate",
        label: "When would you like to have a solution to these problems?",
        placeholder:
          "Example: I would like this fixed as soon as possible, etc.",
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
      "Almost done! This final question helps us add context and information to your letter!",
    tipType: "success",
    questions: [
      {
        name: "additionalInformation",
        label: "Do you have any additional information?",
        placeholder: "Example: Any other details you'd like to include...",
        required: false,
      },
    ],
    submitButtonText: "Generate Letter",
    pageInfoText: "Page 3 of 3 - Ready to submit!",
  },
];
