import "@/styles/globals.css"

export const metadata = {
  title: "16chan",
  description: "If Imgur & Danbooru made love",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
