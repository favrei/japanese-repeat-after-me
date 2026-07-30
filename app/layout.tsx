import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "にほんごものがたり — Japanese story practice",
  description:
    "Speak-the-line Japanese story practice in a manga frame. Android Chrome PWA PoC.",
  applicationName: "Nihongo Monogatari",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "にほんごものがたり",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fffdf4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {/* React 19 hoists these font links into <head>. The service worker
            caches the font CSS and files for repeat offline visits. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hachi+Maru+Pop&family=Klee+One:wght@600&family=Noto+Sans+JP:wght@400;500;700&display=swap"
        />
        {children}
      </body>
    </html>
  );
}
