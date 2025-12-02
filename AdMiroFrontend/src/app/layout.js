import "./globals.css";
import { PageTransition } from "@/components/PageTransition";
import ScrollToTop from "@/components/ScrollToTop";
import ToastProvider from "@/components/ToastProvider";

export const metadata = {
  title: "AdMiro - Digital Advertisement Management",
  description:
    "Manage digital advertisements across multiple displays in real-time",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <PageTransition>{children}</PageTransition>
        <ScrollToTop />
        <ToastProvider />
      </body>
    </html>
  );
}
