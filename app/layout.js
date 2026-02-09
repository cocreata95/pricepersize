import './globals.css'

export const metadata = {
  title: 'PricePerSize - Compare Prices by Unit',
  description: 'Find the best value by comparing prices per unit. Works for groceries, household items, and more.',
  keywords: 'price comparison, unit price, price per gram, price per oz, grocery shopping, best value',
  openGraph: {
    title: 'PricePerSize - Compare Prices by Unit',
    description: 'Find the best value by comparing prices per unit.',
    url: 'https://pricepersize.site',
    siteName: 'PricePerSize',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PricePerSize - Compare Prices by Unit',
    description: 'Find the best value by comparing prices per unit.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
