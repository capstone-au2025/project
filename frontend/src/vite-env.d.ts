/// <reference types="vite/client" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "altcha-widget"?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
