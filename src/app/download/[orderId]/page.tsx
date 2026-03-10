'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type DownloadResponse = {
  file_url: string
  product_title: string
  order_id: string
} | null

export default function DownloadPage() {
  const [downloadData, setDownloadData] = useState<DownloadResponse>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()

  useEffect(() => {
    const { orderId } = params
    
    if (!orderId) {
      setError('no order id provided')
      setLoading(false)
      return
    }

    const fetchDownload = async () => {
      try {
        const response = await fetch(`/api/download/${orderId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('order not found or not completed')
          } else {
            const errorData = await response.json()
            setError(errorData.error || 'failed to fetch download')
          }
          return
        }

        const data = await response.json()
        setDownloadData(data)
      } catch (err) {
        setError('failed to load download')
        console.error('Download fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDownload()
  }, [params])

  const handleDownload = async () => {
    if (!downloadData?.file_url) return

    try {
      // Create a temporary link to download the file
      const link = document.createElement('a')
      link.href = downloadData.file_url
      link.download = downloadData.product_title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">loading...</div>
      </div>
    )
  }

  if (error || !downloadData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="text-red-400 mb-4">⚠️</div>
          <h1 className="text-white text-xl mb-2">download not available</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link 
            href="/"
            className="text-[#10a37f] hover:text-[#0d8f6f] transition-colors"
          >
            go home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        {/* Download Icon */}
        <div className="text-[#10a37f] text-4xl mb-6">⬇</div>
        
        {/* Product Title */}
        <h1 className="text-white text-xl mb-2">{downloadData.product_title}</h1>
        <p className="text-gray-400 mb-8">ready for download</p>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="bg-[#10a37f] hover:bg-[#0d8f6f] text-black px-8 py-3 rounded-lg font-medium transition-colors w-full mb-4"
        >
          download
        </button>

        {/* Order Info */}
        <div className="border-t border-gray-800 pt-4 mt-8">
          <div className="text-xs text-gray-500">
            <p>order: {downloadData.order_id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}