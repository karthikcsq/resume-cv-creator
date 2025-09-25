import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resume/CV LaTeX Creator | Professional Document Builder",
  description: "Create professional resumes and CVs with our modern LaTeX generator. Preview, customize, and download PDF documents or get LaTeX source code for academic and professional use.",
  keywords: "resume builder, CV creator, LaTeX generator, PDF resume, professional documents, job application, academic CV",
  authors: [{ name: "Resume CV Creator" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Resume/CV LaTeX Creator",
    description: "Create professional resumes and CVs with our modern LaTeX generator",
    type: "website",
    siteName: "Resume CV Creator"
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume/CV LaTeX Creator",
    description: "Create professional resumes and CVs with our modern LaTeX generator"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
