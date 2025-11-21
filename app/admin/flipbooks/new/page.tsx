/**
 * Admin Page: Upload New Flipbook Document
 * /admin/flipbooks/new
 */

'use client'

import { useRouter } from 'next/navigation'
import { UploadZone } from '@/components/flipbook/UploadZone'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewFlipbookPage() {
  const router = useRouter()

  const handleUploadComplete = (documentId: string) => {
    // Redirect to document details/processing page
    router.push(`/admin/flipbooks?uploaded=${documentId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/flipbooks"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Upload New Document
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload a PDF to convert into an interactive flipbook
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <UploadZone onUploadComplete={handleUploadComplete} />
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for best results:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Use high-resolution PDFs for best image quality</li>
            <li>• Keep file size under 50MB for faster processing</li>
            <li>• Portrait orientation works best for flipbook format</li>
            <li>• Processing typically takes 30-60 seconds per document</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
