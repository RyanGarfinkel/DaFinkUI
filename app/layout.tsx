import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Obi UI',
  description: 'A design system built for modern React applications',
};

const RootLayout = async (
  {
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>
) => {
  const cookieStore = await cookies();
  const theme  = cookieStore.get('theme')?.value;
  const isDark = theme === 'dark';

  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={[
        geistSans.variable,
        geistMono.variable,
        'h-full antialiased',
        isDark ? 'dark' : '',
      ].join(' ').trim()}
    >
      <head />
      <body className='min-h-full bg-surface text-text'>{children}</body>
    </html>
  );
};

export default RootLayout;
