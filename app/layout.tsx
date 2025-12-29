import './globals.css' // 반드시 이 줄이 최상단에 있어야 함

export const metadata = {
  title: 'iMessage AI',
  description: 'iPhone Style Chat',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </head>
      <body>{children}</body>
    </html>
  )
}
