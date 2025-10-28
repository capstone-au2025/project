// Minimal JSX ambient definitions for environments without installed React types
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}


