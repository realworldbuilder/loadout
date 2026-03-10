'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Order = {
  id: string
  status: string
  buyer_email: string
  buyer_name: string
  amount_cents: number
}

type Product = {
  id: string
  title: string
  description: string
  type: string
  file_url: string | null
  thumbnail_url: string | null
}

type OrderResponse = {
  order: Order
  product: Product
} | null

export default function PurchaseSuccessPage() {
  const [orderData, setOrderData] = useState<OrderResponse>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setError('no session id provided')
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/by-session?session_id=${sessionId}`)
        
        if (!response.ok) {
          throw new Error('failed to fetch order')
        }

        const data = await response.json()
        setOrderData(data)
      } catch (err) {
        setError('failed to load order')
        console.error('Order fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [searchParams])

  const handleDownload = async () => {
    if (!orderData?.product?.file_url) return

    try {
      // Create a temporary link to download the file
      const link = document.createElement('a')
      link.href = orderData.product.file_url
      link.download = orderData.product.title
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

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="text-red-400 mb-4">⚠️</div>
          <h1 className="text-white text-xl mb-2">something went wrong</h1>
          <p className="text-gray-400 mb-6">{error || 'order not found'}</p>
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

  const { order, product } = orderData

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        {/* Success Icon */}
        <div className="text-[#10a37f] text-4xl mb-6">✓</div>
        
        {/* Thank You Message */}
        <h1 className="text-white text-2xl mb-2">thank you!</h1>
        <p className="text-gray-400 mb-6">
          your purchase of <span className="text-white">{product.title}</span> is complete.
        </p>

        {/* Product Details */}
        {product.thumbnail_url && (
          <img 
            src={product.thumbnail_url} 
            alt={product.title}
            className="w-24 h-24 mx-auto mb-6 rounded-lg object-cover"
          />
        )}

        {/* Download Section */}
        {product.file_url ? (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-4">
              your digital product is ready for download
            </p>
            <button
              onClick={handleDownload}
              className="bg-[#10a37f] hover:bg-[#0d8f6f] text-black px-6 py-3 rounded-lg font-medium transition-colors w-full"
            >
              download {product.title}
            </button>
            <p className="text-gray-500 text-xs mt-2">
              having trouble? check your email for order details.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-gray-400 text-sm">
              {product.type === 'link' 
                ? 'check your email for access details'
                : product.type === 'coaching'
                ? 'you will be contacted within 24 hours'
                : 'check your email for next steps'
              }
            </p>
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t border-gray-800 pt-4 mt-8">
          <div className="text-xs text-gray-500 space-y-1">
            <p>order: {order.id}</p>
            <p>email: {order.buyer_email}</p>
            <p>total: ${(order.amount_cents / 100).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}