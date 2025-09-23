import '@/styles/globals.css';
import Link from 'next/link';
import { AuthProvider } from '@/components/AuthProvider';
import AuthControls from '@/components/AuthControls';
import { Inter as InterFont } from 'next/font/google';
import ThemeToggle from '@/components/ThemeToggle';

const inter = InterFont({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Spectra Market',
  description: 'Modern NFT Marketplace',
};

const themeInitScript = `
(function() {
  try {
    const stored = localStorage.getItem('theme');
    const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored === 'light' || stored === 'dark' ? stored : (sysDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' data-theme='dark' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.className} bg-ink min-h-screen`}>
        <div className='min-h-screen bg-hero-gradient flex flex-col'>
          <AuthProvider>
            <Header />
            <main className='flex-1'>
              <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8'>
                {children}
              </div>
            </main>
            <Footer />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className='header'>
      <div className='header-surface'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-3'>
          <Link href='/' className='flex items-center gap-3 group'>
            <span className='logo-dot group-hover:scale-105 transition-transform' />
          </Link>
          <nav className='flex items-center gap-1 sm:gap-2'>
            <Link className='nav-link' href='/market'>
              Market
            </Link>
            <Link className='nav-link' href='/collections'>
              Collections
            </Link>
            <Link className='nav-link' href='/create'>
              Create
            </Link>
            <ThemeToggle />
            <AuthControls />
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className='footer border-t border-white/10 mt-16'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm'>
        © {new Date().getFullYear()} Spectra Market.
      </div>
    </footer>
  );
}