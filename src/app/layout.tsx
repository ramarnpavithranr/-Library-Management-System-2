import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LibraryProvider } from "@/context/LibraryContext";
import { AuthProvider } from "@/context/AuthContext";
import { DeviceModeProvider } from "@/components/common/DeviceFrameToggle";
import { ENV } from "@/config/env";

export const metadata: Metadata = {
  title: ENV.APP_NAME,
  description: `${ENV.COLLEGE_NAME} - ${ENV.LIBRARY_NAME} mobile application`,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SSEC Library",
  },
  icons: {
    icon: "/college-logo.png",
    apple: "/college-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#6E1129",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-burgundy-800 selection:text-white">
        <LibraryProvider>
          <AuthProvider>
            <DeviceModeProvider>
              {children}
            </DeviceModeProvider>
          </AuthProvider>
        </LibraryProvider>
      </body>
    </html>
  );
}

