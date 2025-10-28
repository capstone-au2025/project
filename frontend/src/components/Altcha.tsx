import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

// Register the <altcha-widget> custom element from the official package
import "altcha";

interface AltchaProps {
  onStateChange?: (ev: Event | CustomEvent) => void;
}

const Altcha = forwardRef(function AltchaInner({ onStateChange }: AltchaProps, ref: any) {
  const widgetRef = useRef(null);
  const [value, setValue] = useState(null as string | null);
  const [verified, setVerified] = useState(false);

  useImperativeHandle(ref, () => ({ value, verified }), [value, verified]);

  useEffect(() => {
    const handleStateChange = (ev: Event | CustomEvent) => {
      console.log("ALTCHA state change:", ev);
      if ("detail" in ev) {
        // detail.payload is provided by the widget when solved
        // It may contain the signed result; we still rely on hidden inputs for verification
        // but expose value for debugging/advanced use if needed.
        // @ts-ignore
        const payload = (ev as any).detail?.payload;
        console.log("ALTCHA payload:", payload);
        setValue(payload || null);
        // @ts-ignore
        const state = (ev as any).detail?.state;
        if (state === "verified") {
          setVerified(true);
        }
        onStateChange?.(ev);
      }
    };

    const { current } = widgetRef;
    if (current) {
      current.addEventListener("statechange", handleStateChange);
      return () => current.removeEventListener("statechange", handleStateChange);
    }
  }, [onStateChange]);

  return (
    <altcha-widget
      ref={widgetRef}
      
      challengeurl="/altcha/challenge"
      verifyurl="/altcha/verify"
      
      style={{ "--altcha-max-width": "100%" } as any}
    ></altcha-widget>
  );
});

export default Altcha;


