import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../hooks/useAuth";
import { AccessGate } from "../components/AccessGate";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AccessGate>
        <Component {...pageProps} />
      </AccessGate>
    </AuthProvider>
  );
}
