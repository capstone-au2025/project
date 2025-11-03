// import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

// // Register the <altcha-widget> custom element from the official package
// import "altcha";

// interface AltchaProps {
//   onStateChange?: (ev: Event | CustomEvent) => void;
// }

// // Minimal type for the custom element value
// interface AltchaEventDetail {
//   payload?: string | null;
//   state?: string;
// }

// type AltchaElement = HTMLElement & { verified?: boolean };

// type ExposedState = { value: string | null; verified: boolean };

// const Altcha = forwardRef(function AltchaInner(
//   { onStateChange }: AltchaProps,
//   ref
// ) {
//   const widgetRef = useRef<AltchaElement | null>(null);
//   const [value, setValue] = useState<string | null>(null);
//   const [verified, setVerified] = useState(false);

//   useImperativeHandle(ref, () => ({ value, verified } as ExposedState), [value, verified]);

//   useEffect(() => {
//     const handleStateChange = (ev: Event | CustomEvent) => {
//       console.log("Althca payload:", value);
//       if ("detail" in ev) {
//         const detail = (ev as CustomEvent<AltchaEventDetail>).detail;
//         const payload = detail?.payload ?? null;
//         setValue(payload);
//         const state = detail?.state;
//         if (state === "verified") {
//           setVerified(true);
//         }
//         onStateChange?.(ev);
//       }
//     };

//     const { current } = widgetRef;
//     if (current) {
//       current.addEventListener("statechange", handleStateChange as EventListener);
//       return () => current.removeEventListener("statechange", handleStateChange as EventListener);
//     }
//   }, [onStateChange]);

//   return (
//     <altcha-widget
//       ref={widgetRef}
//       challengeurl="/api/altcha/challenge"
//       verifyurl="/api/altcha/verify"
      
//       debug
//       style={{ "--altcha-max-width": "100%" }}
//     ></altcha-widget>
//   );
// });

// export default Altcha;


import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

// Importing altcha package will introduce a new element <altcha-widget>
import 'altcha'

interface AltchaProps {
  onStateChange?: (ev: Event | CustomEvent) => void
}

const Altcha = forwardRef<{ value: string | null }, AltchaProps>(({ onStateChange }, ref) => {
  const widgetRef = useRef<AltchaWidget & AltchaWidgetMethods & HTMLElement>(null)
  const [value, setValue] = useState<string | null>(null)

  useImperativeHandle(ref, () => {
    return {
      get value() {
        return value
      }
    }
  }, [value])

  useEffect(() => {
    const handleStateChange = async (ev: Event | CustomEvent) => {
      if ('detail' in ev) {
        setValue(ev.detail.payload || null);
        onStateChange?.(ev);
      }
  
    }

    const { current } = widgetRef

    if (current) {
      current.addEventListener('statechange', handleStateChange)
      return () => current.removeEventListener('statechange', handleStateChange)
    }
  }, [onStateChange])

  
  return (
    <altcha-widget
      ref={widgetRef}
      style={{
        '--altcha-max-width': '100%',
      }}
      
      challengeurl="/api/altcha/challenge"
      verifyurl="/api/altcha/verify"
    ></altcha-widget>
  )
})

export default Altcha
