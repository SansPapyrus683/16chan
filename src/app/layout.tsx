import "@/globals.css";

import { NavBar } from "@/components/NavBar";
import React from "react";

import { Comic_Neue } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@/lib/utils";

const comicNeue = Comic_Neue({
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "16chan",
  description: "if imgur & danbooru made love",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          comicNeue.className,
          "min-h-screen bg-background font-sans antialiased",
        )}
      >
        <TRPCReactProvider>
          <ClerkProvider>
            <div className="flex h-screen">
              <NavBar />
              <div className="mx-9 flex-grow pt-16">{children}</div>
            </div>
          </ClerkProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
