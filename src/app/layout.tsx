import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://studio.frameandformstudio.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Listing Studio — by Frame & Form Studio",
  description:
    "Turn one listing into 14 days of branded social content — posts, reels, and stories, written and rendered for you.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Listing Studio",
    locale: "en_US",
    url: "/",
    title: "Listing Studio — by Frame & Form Studio",
    description:
      "Turn one listing into 14 days of branded social content — posts, reels, and stories, written and rendered for you.",
    images: [
      {
        // Shared brand OG image served from the main site.
        url: "https://www.frameandformstudio.com/og.jpg",
        width: 1200,
        height: 630,
        alt: "Frame & Form Studio — real estate media in Southwest Florida",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Listing Studio — by Frame & Form Studio",
    description:
      "Turn one listing into 14 days of branded social content — posts, reels, and stories, written and rendered for you.",
    images: ["https://www.frameandformstudio.com/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cormorant.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
