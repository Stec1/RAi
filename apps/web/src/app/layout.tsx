import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RAi',
  description: 'Your place in the meta-universe',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
