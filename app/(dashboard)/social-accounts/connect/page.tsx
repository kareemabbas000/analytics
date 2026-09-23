import { connectAccount } from '../actions'
import { Instagram, Facebook, Twitter, Youtube, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ConnectChannelPage() {
  // In a real app, clicking these would redirect to a Zernio OAuth URL
  // Here we use server actions to simulate a successful connection return.
  
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link href="/social-accounts" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Social Accounts
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Connect a Channel</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a platform to authorize Zernio access. You will be securely redirected to the platform to approve permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Instagram */}
        <form action={connectAccount.bind(null, 'instagram')}>
          <button className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:border-pink-300 hover:shadow-md hover:shadow-pink-100 transition-all text-center group">
            <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
              <Instagram className="w-8 h-8 text-pink-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Instagram</p>
              <p className="text-xs text-gray-500 mt-1">Connect Business or Creator account</p>
            </div>
          </button>
        </form>

        {/* Facebook */}
        <form action={connectAccount.bind(null, 'facebook')}>
          <button className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100 transition-all text-center group">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Facebook className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Facebook</p>
              <p className="text-xs text-gray-500 mt-1">Connect Facebook Page</p>
            </div>
          </button>
        </form>

        {/* Twitter */}
        <form action={connectAccount.bind(null, 'twitter')}>
          <button className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100 transition-all text-center group">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
              <Twitter className="w-8 h-8 text-sky-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">X (Twitter)</p>
              <p className="text-xs text-gray-500 mt-1">Connect X account</p>
            </div>
          </button>
        </form>

        {/* YouTube */}
        <form action={connectAccount.bind(null, 'youtube')}>
          <button className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:border-red-300 hover:shadow-md hover:shadow-red-100 transition-all text-center group">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <Youtube className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">YouTube</p>
              <p className="text-xs text-gray-500 mt-1">Connect YouTube channel</p>
            </div>
          </button>
        </form>
      </div>
    </div>
  )
}
