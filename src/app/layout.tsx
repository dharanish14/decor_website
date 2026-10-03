import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Elshadai Decors | Curtains, Blinds & Home Furnishings in Chennai',
  description: 'Elshadai Decors helps Chennai homes feel more like home with curtains, blinds, sofas, upholstery, and considered finishing touches.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
