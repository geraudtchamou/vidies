import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'MediaFlow - Download, Convert & Compress Videos',
  description: 'A privacy-first cross-platform tool to download videos, convert to audio, and compress videos efficiently. All processing happens in your browser or on-device.',
  keywords: ['video downloader', 'video converter', 'video compressor', 'audio extractor', 'privacy-first', 'FFmpeg'],
  authors: [{ name: 'MediaFlow' }],
  openGraph: {
    title: 'MediaFlow - Video Tools',
    description: 'Download, convert, and compress videos with privacy-first approach',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border-color bg-bg-surface py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-secondary text-sm">
                <p>© 2024 MediaFlow. Privacy-first video processing.</p>
                <p className="mt-1">All processing happens locally in your browser.</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

