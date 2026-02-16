import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/shared/theme-provider.tsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/index.ts";
import { Toaster } from "@/components/ui/sonner";
import { SocketProvider } from "@/components/shared/socket-provider.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <BrowserRouter>
              <App />
              <Toaster richColors position="bottom-right" />
            </BrowserRouter>
          </ThemeProvider>
        </SocketProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
