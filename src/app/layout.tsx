import type { Metadata } from "next";
import "./globals.css";
import { LibraryProvider } from "@/context/LibraryContext";
import { AuthProvider } from "@/context/AuthContext";
import { DeviceModeProvider } from "@/components/common/DeviceFrameToggle";
import { ENV } from "@/config/env";

export const metadata: Metadata = {
  title: ENV.APP_NAME,
  description: `${ENV.COLLEGE_NAME} - ${ENV.LIBRARY_NAME} mobile-first application`,
  icons: {
    icon: "/favicon.ico",
  },
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

