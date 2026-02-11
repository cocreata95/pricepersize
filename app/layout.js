import './globals.css'

const baseUrl = 'https://pricepersize.site'

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'PricePerSize - Grocery Pricing Intelligence | Verify Shelf Tags & Compare Prices',
    template: '%s | PricePerSize',
  },
  description: 'Shelf tag math is wrong 30% of the time. PricePerSize helps you verify shelf prices, catch calculation errors, and compare unit prices across different pack sizes. Free, fast, no signup.',
  keywords: [
    'unit price calculator',
    'shelf tag checker',
    'price per gram calculator',
    'price per ounce calculator',
    'grocery price comparison',
    'verify shelf price',
    'unit price verification',
    'price per ml',
    'price per kg',
    'shopping calculator',
    'unit price comparison',
    'grocery pricing errors',
  ],
  authors: [{ name: 'PricePerSize' }],
  creator: 'PricePerSize',
  publisher: 'PricePerSize',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: 'PricePerSize - Grocery Pricing Intelligence',
    description: 'Shelf tags wrong 30% of the time. Verify prices, catch errors, compare unit costs. Free grocery price checker.',
    url: baseUrl,
    siteName: 'PricePerSize',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PricePerSize - Verify Shelf Tag Math',
    description: 'Shelf tags wrong 30% of the time. Catch pricing errors and compare unit prices instantly.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  category: 'finance',
}

// JSON-LD Schema for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'PricePerSize',
      description: 'Free unit price calculator for comparing product values',
      publisher: {
        '@id': `${baseUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'PricePerSize',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${baseUrl}/#app`,
      name: 'PricePerSize Unit Price Calculator',
      description: 'Calculate and compare unit prices for any product. Find the best value when shopping for groceries, household items, and more.',
      url: baseUrl,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Compare prices per gram, ounce, ml, liter, and more',
        'Calculate savings between products',
        'Verify shelf tag accuracy',
        'Works offline',
        'No signup required',
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${baseUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I calculate price per unit?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Enter the total price and product size, select your unit (grams, ounces, ml, etc.), and PricePerSize will instantly calculate the price per unit for easy comparison.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is PricePerSize free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, PricePerSize is completely free with no ads, no signup, and no hidden costs.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I compare products with different units?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, PricePerSize automatically converts between compatible units (like grams to ounces, or ml to liters) so you can compare products regardless of how they are labeled.',
          },
        },
      ],
    },
  ],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
