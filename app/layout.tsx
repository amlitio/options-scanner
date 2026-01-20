import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Options Scanner - Find Low-Cost Opportunities',
  description: 'Automated scanner for $1-$10 options with high potential',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
