import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
declare namespace JSX { interface IntrinsicElements { [elem: string]: any } }
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
