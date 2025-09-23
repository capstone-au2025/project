export type NameAndAddress = {
  name: string;
  address: string;
  company: string | undefined;
  state: State;
  city: string;
  zip: string;
};

export type SendMailOptions = {
  pdfName: string;
  pdfBytes: Uint8Array;
  letterName: string;
  duplex: boolean;
  sender: NameAndAddress;
  destination: NameAndAddress;
};

export const STATES = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VI: "Virgin Islands",
  WV: "West Virginia",
  VA: "Virginia",
  WA: "Washington",
  WI: "Wisconsin",
  WY: "Wyoming",
  PR: "Puerto Rico",
} as const;

export type State = keyof typeof STATES;

const ACTION_URL = "https://www.onlinecertifiedmail.com/step2.php";

export function sendMail(options: SendMailOptions) {
  const file = new File([options.pdfBytes], options.pdfName, {
    type: "application/pdf",
  });
  const data = {
    activeoption: "upload",
    jobname: options.letterName,
    jobfile: file,
    duplex: options.duplex ? "Yes" : "No",
    sendername1: options.sender.name,
    sendername2: options.sender.company ?? "",
    senderaddress1: options.sender.address,
    sendercity: options.sender.city,
    senderstate: options.sender.state,
    senderzip: options.sender.zip,
    destname1: options.destination.name,
    destname2: options.destination.company ?? "",
    destaddress1: options.destination.address,
    destcity: options.destination.city,
    deststate: options.destination.state,
    destzip: options.destination.zip,
  };
  submitHiddenForm(ACTION_URL, data, { newTab: true });
}

function submitHiddenForm(
  actionUrl: string,
  data: Record<string, string | File>,
  { newTab }: { newTab: boolean },
): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.enctype = "multipart/form-data";
  if (newTab) {
    form.target = "_blank";
  }
  form.style.display = "none";

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.name = key;

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(value);
      fileInput.files = dataTransfer.files;

      form.appendChild(fileInput);
    } else {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
