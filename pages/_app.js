import "@/styles/globals.css";
import { TranslationProvider } from '../utils/translationEngine';

export default function App({ Component, pageProps }) {
  return (
    <TranslationProvider>
      <Component {...pageProps} />
    </TranslationProvider>
  );
}
