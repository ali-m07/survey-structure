import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../hooks/useAuth";
import { AccessGate } from "../components/AccessGate";
import { LocaleProvider } from "../i18n/LocaleProvider";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <AccessGate>
          <Component {...pageProps} />
        </AccessGate>
      </AuthProvider>
    </LocaleProvider>
  );
}
