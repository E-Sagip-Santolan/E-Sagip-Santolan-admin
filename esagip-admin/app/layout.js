import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata = {
  title: "E-Sagip | Admin Portal",
  description: "E-Sagip Santolan administration portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
