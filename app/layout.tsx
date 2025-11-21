import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio Flipbook System',
  description: 'Interactive PDF flipbook viewer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; }
          .min-h-screen { min-height: 100vh; }
          .bg-gradient-to-b { background: linear-gradient(to bottom, #f9fafb, #f3f4f6); }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .p-8 { padding: 2rem; }
          .max-w-2xl { max-width: 42rem; }
          .w-full { width: 100%; }
          .bg-white { background-color: white; }
          .rounded-2xl { border-radius: 1rem; }
          .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
          .p-12 { padding: 3rem; }
          .text-center { text-align: center; }
          .mb-8 { margin-bottom: 2rem; }
          .text-6xl { font-size: 3.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .text-4xl { font-size: 2.25rem; }
          .font-bold { font-weight: 700; }
          .text-gray-900 { color: #111827; }
          .text-lg { font-size: 1.125rem; }
          .text-gray-600 { color: #4b5563; }
          .space-y-4 > * + * { margin-top: 1rem; }
          .block { display: block; }
          .bg-blue-600 { background-color: #2563eb; }
          .text-white { color: white; }
          .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .rounded-lg { border-radius: 0.5rem; }
          .hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
          .transition-colors { transition-property: background-color, border-color, color; }
          .font-semibold { font-weight: 600; }
          .mt-12 { margin-top: 3rem; }
          .pt-8 { padding-top: 2rem; }
          .border-t { border-top-width: 1px; }
          .border-gray-200 { border-color: #e5e7eb; }
          .grid { display: grid; }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-6 { gap: 1.5rem; }
          .text-sm { font-size: 0.875rem; }
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .text-gray-500 { color: #6b7280; }
          .underline { text-decoration: underline; }
          .text-blue-600 { color: #2563eb; }
          .hover\\:text-blue-800:hover { color: #1e40af; }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
