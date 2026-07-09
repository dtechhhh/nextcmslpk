import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
  weight: "variable",
});

const notoSansJp = Noto_Sans_JP({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: "variable",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "PT Hashimoto Indo Trust",
    template: "%s | PT Hashimoto Indo Trust",
  },
  description:
    "Lembaga Pelatihan Kerja resmi untuk penempatan tenaga kerja Indonesia ke Jepang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSansJp.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
