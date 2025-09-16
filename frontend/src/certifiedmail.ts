export type NameAndAddress = {
  name: string;
  address: string;
  company: string | undefined;
  state: string; // two capital letter postal abbreviation, eg. AZ
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
