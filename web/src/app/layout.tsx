import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import PrimeReact CSS
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "English Listening Practice",
  description: "Practice your English listening skills with audio transcription",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}