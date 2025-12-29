export const metadata = {
  title: 'AI iMessage',
  description: 'Clean start version',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#F2F2F7', fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
