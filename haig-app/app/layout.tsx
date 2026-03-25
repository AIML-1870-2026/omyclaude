import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "High Agency Investment Group",
  description: "HAIG student-run investment club portal"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
