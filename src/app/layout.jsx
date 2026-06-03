import './globals.css';

export const metadata = {
  title: 'Daily Love Letter Assistant 💌',
  description: 'Send a heartfelt love letter every day, automatically.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{background:'#fff8f0'}}>
        {children}
      </body>
    </html>
  );
}
