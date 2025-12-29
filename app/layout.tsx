export const metadata = {
  title: 'AI iMessage',
  description: 'Clean start version',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
