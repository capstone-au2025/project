import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import FormContainer from "./components/FormContainer";
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FormContainer />
    </QueryClientProvider>
  );
}

export default App;
