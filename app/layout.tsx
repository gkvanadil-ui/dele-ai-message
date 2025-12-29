import './globals.css';

export const metadata = {
  title: 'AI iMessage',
  description: 'Clean Start',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-100">{children}</body>
    </html>
  );
}
