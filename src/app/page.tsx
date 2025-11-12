import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Sticky - Custom Sticker Design
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Design professional die-cut stickers with AI-powered tools, 3D previews, and instant printing
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Link
              href="/auth/signin"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-4 px-8 rounded-lg shadow-lg border-2 border-indigo-600 transition duration-200"
            >
              Sign Up
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🎨 AI Design Tools</h3>
              <p className="text-gray-600">
                Generate custom mascots and logos using AI. Remove backgrounds and create perfect die-cut paths.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">👁️ 3D Preview</h3>
              <p className="text-gray-600">
                See exact die-cut previews in 3D before printing. Rotate, zoom, and inspect every detail.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📦 Professional Printing</h3>
              <p className="text-gray-600">
                Order high-quality stickers delivered to your door through our Printful integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
