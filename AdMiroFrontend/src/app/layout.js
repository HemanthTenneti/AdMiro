import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { PageTransition } from "@/components/PageTransition";

export const metadata = {
  title: "AdMiro - Digital Advertisement Management",
  description:
    "Manage digital advertisements across multiple displays in real-time",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <PageTransition>{children}</PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
