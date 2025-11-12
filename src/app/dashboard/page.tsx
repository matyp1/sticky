'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface Design {
  id: string
  name: string
  image_url: string | null
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)
      loadDesigns(user.id)
    }

    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase.auth])

  const loadDesigns = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDesigns(data || [])
    } catch (error) {
      console.error('Error loading designs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Sticky</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Designs</h2>
          <Link
            href="/editor"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-200"
          >
            + New Design
          </Link>
        </div>

        {designs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No designs yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first custom sticker design!
            </p>
            <Link
              href="/editor"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition duration-200"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <div
                key={design.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-200"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {design.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={design.image_url}
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">🖼️</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {design.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Created {new Date(design.created_at).toLocaleDateString()}
                  </p>
                  <Link
                    href={`/editor?id=${design.id}`}
                    className="block text-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium px-4 py-2 rounded-md transition duration-200"
                  >
                    Edit Design
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
