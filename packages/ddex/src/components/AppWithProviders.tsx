import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AudiusLibsProvider } from "../providers/AudiusLibsProvider";
import { AudiusSdkProvider } from "../providers/AudiusSdkProvider";
import App from "./App";
import Web3 from "web3";

declare global {
  interface Window {
    Web3: any;
  }
}

const AppWithProviders = () => {
  window.Web3 = Web3;

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AudiusLibsProvider>
        <AudiusSdkProvider>
          <App />
        </AudiusSdkProvider>
      </AudiusLibsProvider>
    </QueryClientProvider>
  );
};

export default AppWithProviders;