export const metadata = {
  title: "AI Assistant",
};

import "./globals.css";  // Import global CSS styles

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
