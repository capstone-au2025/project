/// <reference types="vite/client" />

// Fallback ambient declarations to satisfy tooling when node_modules types are unavailable
declare module "react";
declare module "react/jsx-runtime";
declare module "*.css";
declare module "altcha";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
      "altcha-widget"?: any;
    }
  }
}
