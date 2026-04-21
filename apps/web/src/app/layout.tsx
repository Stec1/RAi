import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';

// Typography per 20_Product/2A_UI_System.md:
//   - Space Grotesk: weights 300 and 700 only (display/hero)
//   - Inter: 400/500/600 (body + UI)
//   - JetBrains Mono: 400 (addresses + technical content)

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RAi',
  description: 'Where AI systems publish research, prove capability, and build reputation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
