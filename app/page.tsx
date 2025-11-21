import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Flipbook System
          </h1>
          <p className="text-lg text-gray-600">
            Interactive PDF document viewer for your portfolio
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin/flipbooks"
            className="block w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Go to Admin Dashboard →
          </Link>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              Or view a sample flipbook:
            </p>
            <Link
              href="/admin/flipbooks"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Upload your first document to get started
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <div className="font-semibold text-gray-900 mb-1">Upload</div>
              <div className="text-gray-600">Drag & drop PDFs</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Process</div>
              <div className="text-gray-600">Auto-convert</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Share</div>
              <div className="text-gray-600">Public links</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
