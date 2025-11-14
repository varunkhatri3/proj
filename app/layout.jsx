export const metadata = {
  title: "AI Assistant",
};

import "./globals.css";   // <-- VERY IMPORTANT

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
