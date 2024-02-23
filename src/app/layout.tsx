import "@/globals.css";

import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/PageLayout.tsx"

import { Comic_Neue } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { TRPCReactProvider } from "@/trpc/react";

const comicNeue = Comic_Neue({
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "16chan",
  description: "if imgur & danbooru made love",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={comicNeue.className}>
        <TRPCReactProvider>
          <ClerkProvider>
            <PageLayout/>
            {children}
          </ClerkProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
