import "@/globals.css";

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
            <div className="bg-green-300 flex-1 space-y-2 p-8 pt-6">
              <div className="bg-green-400 flex items-center justify-between space-y-2">
                <h2 className="bg-green-500 text-3xl font-bold tracking-tight">Djshboard</h2>
                <h2 className="bg-green-500 text-3xl font-bold tracking-tight">Ajasdf</h2>
                <h2 className="bg-green-500 text-3xl font-bold tracking-tight">Asdfasd asdf</h2>
                <h2 className="bg-green-500 text-3xl font-bold tracking-tight">Asdfasd asdf</h2>
                <div className="bg-green-500 flex items-center space-x-2">
                  <div>adsf</div>
                  <div>adsf</div>
                  <div>adsf</div>
                </div>
              </div>
              hello
            </div>
            <div className="container mx-auto">
              header
            </div>
            {children}
          </ClerkProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
