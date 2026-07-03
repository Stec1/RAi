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
  description:
    'RAI is a universe of observatories — real places, virtual worlds, and the stories people tell about them.',
};

// Pre-hydration theme bootstrap (DL-32). Runs synchronously as the first
// thing in <body> so the [data-theme] attribute exists before first paint —
// no dark→light flash for returning light-theme users. Default is dark.
// suppressHydrationWarning on <html> covers the attribute this script sets.
const themeInitScript = `(function(){var t='dark';try{var s=localStorage.getItem('rai-theme');if(s==='light'||s==='dark'){t=s;}}catch(e){}document.documentElement.setAttribute('data-theme',t);})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
