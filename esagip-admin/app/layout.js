import "./globals.css";

export const metadata = {
  title: "E-Sagip | Admin Portal",
  description: "E-Sagip Santolan administration portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
