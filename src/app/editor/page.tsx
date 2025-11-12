'use client'

import { useEffect, useState, Suspense } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Export dynamic config
export const runtime = 'edge'

// Dynamically import the 3D component to avoid SSR issues
const StickerPreview3D = dynamic(() => import('@/components/StickerPreview3D'), {
  ssr: false,
})

function EditorContent() {
  const [user, setUser] = useState<any>(null)
  const [designName, setDesignName] = useState('Untitled Design')
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [processedImage, setProcessedImage] = useState<string>('')
  const [cutPath, setCutPath] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)

      // Load existing design if ID provided
      const designId = searchParams.get('id')
      if (designId) {
        loadDesign(designId)
      }
    }

    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams, supabase.auth])

  const loadDesign = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (data) {
        setDesignName(data.name)
        setGeneratedImage(data.image_url || '')
        setProcessedImage(data.image_url || '')
        setCutPath(data.cut_path || '')
      }
    } catch (error) {
      console.error('Error loading design:', error)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      
      if (data.error) {
        alert(data.error)
        return
      }

      setGeneratedImage(data.imageUrl)
      setProcessedImage(data.imageUrl)
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBackground = async () => {
    if (!generatedImage) return

    setProcessing(true)
    try {
      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: generatedImage }),
      })

      const data = await response.json()
      
      if (data.error) {
        alert(data.error)
        return
      }

      setProcessedImage(data.imageUrl)
      setCutPath(data.cutPath)
    } catch (error) {
      console.error('Error removing background:', error)
      alert('Failed to remove background')
    } finally {
      setProcessing(false)
    }
  }

  const handleSaveDesign = async () => {
    if (!user) return

    setSaving(true)
    try {
      const designData = {
        name: designName,
        design_data: { prompt },
        image_url: processedImage,
        cut_path: cutPath,
      }

      const designId = searchParams.get('id')
      
      if (designId) {
        // Update existing design
        const { error } = await supabase
          .from('designs')
          .update({ ...designData, updated_at: new Date().toISOString() })
          .eq('id', designId)

        if (error) throw error
      } else {
        // Create new design
        const { error } = await supabase
          .from('designs')
          .insert({ ...designData, user_id: user.id })

        if (error) throw error
      }

      alert('Design saved successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving design:', error)
      alert('Failed to save design')
    } finally {
      setSaving(false)
    }
  }

  const handleOrderStickers = async () => {
    if (!processedImage) {
      alert('Please generate and process a design first')
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: processedImage,
          cutPath: cutPath,
          designName: designName,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        alert(data.error)
        return
      }

      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to create checkout')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
              Sticky
            </Link>
            <span className="text-gray-400">|</span>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-2"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveDesign}
              disabled={saving}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition duration-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Tools */}
          <div className="space-y-6">
            {/* AI Generation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🤖 AI Image Generation
              </h3>
              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your mascot or logo... (e.g., 'A friendly cartoon plumber holding a wrench')"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            </div>

            {/* Image Processing */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ✂️ Image Processing
              </h3>
              <div className="space-y-4">
                <button
                  onClick={handleRemoveBackground}
                  disabled={processing || !generatedImage}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Remove Background & Create Cut Path'}
                </button>
                <p className="text-sm text-gray-600">
                  This will remove the background and generate a precise die-cut path for your sticker.
                </p>
              </div>
            </div>

            {/* Generated Image Preview */}
            {generatedImage && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  🖼️ Generated Image
                </h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedImage}
                  alt="Generated design"
                  className="w-full rounded-md"
                />
              </div>
            )}

            {/* Order */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📦 Order Stickers
              </h3>
              <button
                onClick={handleOrderStickers}
                disabled={!processedImage}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50"
              >
                Order Printed Stickers
              </button>
            </div>
          </div>

          {/* Right Panel - 3D Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              👁️ 3D Die-Cut Preview
            </h3>
            <div className="relative" style={{ height: '600px' }}>
              <StickerPreview3D imageUrl={processedImage} cutPath={cutPath} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Editor() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  )
}
