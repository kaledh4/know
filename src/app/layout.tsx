import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Playfair_Display } from 'next/font/google';
import "./globals.css";
import Body from "@/components/layout/Body";

// IBM Plex Sans Arabic - The single unified font for the entire app
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-arabic',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "KnowledgeVerse",
  description: "Your personal knowledge management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const basePath = '/know';

  return (
    <html lang="en" className={`dark ${ibmPlexArabic.variable} ${playfair.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KnowledgeVerse" />
        <meta name="application-name" content="KnowledgeVerse" />
        <meta name="msapplication-TileColor" content="#050505" />
        <meta name="theme-color" content="#050505" />
        <link rel="apple-touch-icon" sizes="1024x1024" href={`${basePath}/static/icons/icon-192.jpg`} />
        <link rel="apple-touch-icon" sizes="1024x1024" href={`${basePath}/static/icons/icon-512.jpg`} />
        <link rel="icon" type="image/jpeg" sizes="1024x1024" href={`${basePath}/static/icons/icon-192.jpg`} />
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <link rel="serviceworker" href={`${basePath}/sw.js`} />
        <meta name="msapplication-config" content="none" />
        <style>
          {`
            body.loading .splash-screen {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              width: 100vw;
              position: fixed;
              top: 0;
              left: 0;
              background-color: #050505;
              z-index: 9999;
            }
            body.loading .main-content {
              display: none;
            }
            body:not(.loading) .splash-screen {
              display: none;
            }
            .splash-screen .logo {
              width: 120px;
              opacity: 0;
              animation: fadeIn 1.5s ease-in forwards;
            }
            @keyframes fadeIn {
              to { opacity: 1; }
            }
          `}
        </style>
      </head>
      <body className="antialiased font-body">
        <Body>{children}</Body>
      </body>
    </html>
  );
}
