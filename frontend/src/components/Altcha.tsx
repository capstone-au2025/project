import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

// Register the <altcha-widget> custom element from the official package
import "altcha";

interface AltchaProps {
  onStateChange?: (ev: Event | CustomEvent) => void;
}

// Minimal type for the custom element value
interface AltchaEventDetail {
  payload?: string | null;
  state?: string;
}

type AltchaElement = HTMLElement & { verified?: boolean };

type ExposedState = { value: string | null; verified: boolean };

const Altcha = forwardRef(function AltchaInner(
  { onStateChange }: AltchaProps,
  ref
) {
  const widgetRef = useRef<AltchaElement | null>(null);
  const [value, setValue] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useImperativeHandle(ref as any, () => ({ value, verified } as ExposedState), [value, verified]);

  useEffect(() => {
    const handleStateChange = (ev: Event | CustomEvent) => {
      console.log("ALTCHA state change:", ev);
      if ("detail" in ev) {
        const detail = (ev as CustomEvent<AltchaEventDetail>).detail;
        const payload = detail?.payload ?? null;
        setValue(payload);
        const state = detail?.state;
        if (state === "verified") {
          setVerified(true);
        }
        onStateChange?.(ev);
      }
    };

    const { current } = widgetRef;
    if (current) {
      current.addEventListener("statechange", handleStateChange as EventListener);
      return () => current.removeEventListener("statechange", handleStateChange as EventListener);
    }
  }, [onStateChange]);

  return (
    <altcha-widget
      ref={widgetRef as unknown as any}
      
      challengeurl="/altcha/challenge"
      verifyurl="/altcha/verify"
      
      style={{ "--altcha-max-width": "100%" } as any}
    ></altcha-widget>
  );
});

export default Altcha;


