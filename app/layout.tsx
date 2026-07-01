import type { Metadata, Viewport } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "StarPrep AI, STAAR Practice Questions for Texas Classrooms",
    template: "%s, StarPrep AI",
  },
  description:
    "Generate unlimited TEKS-aligned STAAR practice questions in seconds. Built for Texas teachers, grades 3 through 8 and EOC.",
  applicationName: "StarPrep AI",
  authors: [{ name: "StarPrep AI" }],
  keywords: [
    "STAAR",
    "TEKS",
    "Texas education",
    "practice questions",
    "AI question generator",
    "test prep",
    "K-12 assessment",
  ],
  openGraph: {
    type: "website",
    title: "StarPrep AI",
    description:
      "AI-generated, TEKS-aligned STAAR practice for Texas educators. Generate, assign, grade, analyze, all in one place.",
    siteName: "StarPrep AI",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "StarPrep AI",
    description:
      "AI-generated, TEKS-aligned STAAR practice for Texas educators.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F5F2ED",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
