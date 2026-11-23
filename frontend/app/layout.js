'use client';
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>JeevanDhara — AI Health Surveillance</title>
        <meta name="description" content="Smart Health Surveillance and Early Warning System" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><defs><linearGradient id='g' x1='20' y1='3' x2='20' y2='37' gradientUnits='userSpaceOnUse'><stop offset='0%25' stop-color='%2338bdf8'/><stop offset='100%25' stop-color='%236366f1'/></linearGradient></defs><path d='M20 3 L34 9 L34 20 C34 28 20 37 20 37 C20 37 6 28 6 20 L6 9 Z' fill='url(%23g)'/><rect x='17' y='12' width='6' height='16' rx='1.5' fill='white'/><rect x='12' y='17' width='16' height='6' rx='1.5' fill='white'/></svg>" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
