/**
 * Drag & Drop Upload Zone Component
 * For uploading PDF documents to flipbook system
 */

'use client'

import { useCallback, useState } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { uploadFlipbookAction } from '@/app/actions/flipbook-upload'

interface UploadZoneProps {
  onUploadComplete?: (documentId: string) => void
  maxSize?: number // in bytes
}

export function UploadZone({ onUploadComplete, maxSize = 50 * 1024 * 1024 }: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setError(null)

      // Auto-fill title from filename
      if (!title) {
        const filename = file.name.replace(/\.pdf$/i, '')
        setTitle(filename)
      }
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      setError('Please select a file and provide a title')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      console.log('🚀 Starting upload:', {
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        title,
      })

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', title)
      if (description) formData.append('description', description)

      // Simulate progress (real progress would require chunked upload)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      console.log('📤 Calling Server Action...')
      const startTime = Date.now()

      // Use Server Action instead of API route (bypasses 4.5MB body size limit)
      const result = await uploadFlipbookAction(formData)

      const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`✅ Response received in ${uploadTime}s`)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      const data = result

      // Background job processing is triggered automatically by the Server Action
      console.log('✅ Upload complete! Background processing started.')

      // Reset form
      setSelectedFile(null)
      setTitle('')
      setDescription('')
      setUploadProgress(0)

      if (data.document) {
        onUploadComplete?.(data.document.id)
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Upload timed out. Please try again with a smaller file.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Upload failed')
      }
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  const fileSizeInMB = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0'

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Drop Zone */}
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

          {isDragActive ? (
            <p className="text-lg text-blue-600 font-medium">Drop your PDF here</p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop your PDF here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Maximum file size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
              </p>
            </>
          )}
        </div>
      ) : (
        /* Selected File Preview */
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <FileText className="w-8 h-8 text-red-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {fileSizeInMB} MB • PDF Document
                  </p>
                </div>

                {!uploading && (
                  <button
                    onClick={removeFile}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">File rejected</p>
            <p className="text-sm text-red-700 mt-1">
              {fileRejections[0].errors[0].message}
            </p>
          </div>
        </div>
      )}

      {/* Metadata Form */}
      {selectedFile && !uploading && (
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!title || uploading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Upload & Process
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Processing document...</span>
            <span className="font-medium text-gray-900">{uploadProgress}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <p className="text-xs text-gray-500">
            Your document is being converted to a flipbook. This may take a few moments.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Upload failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
