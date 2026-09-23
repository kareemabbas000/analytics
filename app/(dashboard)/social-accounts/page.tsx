import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, CheckCircle2, Image as Instagram, Users as Facebook, AtSign as Twitter, Video as Youtube } from 'lucide-react'

export default async function SocialAccountsPage() {
  const supabase = await createClient()

  // Fetch connected accounts for this user's organizations
  const { data: accounts, error } = await supabase
    .from('zernio_connected_accounts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Social Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your connected channels for publishing and analytics.</p>
        </div>
        <Link 
          href="/social-accounts/connect"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Connect Channel
        </Link>
      </div>

      {!accounts || accounts.length === 0 ? (
        <div className="mt-8 bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">No social accounts connected</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Connect your first social channel through Zernio to start publishing and collecting analytics.
          </p>
          <Link 
            href="/social-accounts/connect"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            Connect Channel
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {account.platform === 'instagram' && <Instagram className="w-8 h-8 text-pink-600" />}
                  {account.platform === 'facebook' && <Facebook className="w-8 h-8 text-blue-600" />}
                  <span className="font-semibold text-gray-900 capitalize">{account.platform}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                  Connected
                </span>
              </div>
              
              <div>
                <p className="text-lg font-bold text-gray-900">{account.handle || 'Unknown Account'}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">Zernio ID: {account.zernio_account_id}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-4 text-sm font-medium text-gray-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Analytics
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Publishing
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
