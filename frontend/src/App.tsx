import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import "./App.css";
import FormContainer from "./components/FormContainer";
import { configReady } from "./config/configLoader";

const queryClient = new QueryClient();

function App() {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    configReady
      .then(() => {
        setConfigLoaded(true);
      })
      .catch((error) => {
        setConfigError(
          error instanceof Error
            ? error.message
            : "Unknown error loading config",
        );
      });
  }, []);

  if (configError) {
    return (
      <div style={{ padding: "20px", color: "red" }}>Error: {configError}</div>
    );
  }

  if (!configLoaded) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <FormContainer />
    </QueryClientProvider>
  );
}

export default App;
