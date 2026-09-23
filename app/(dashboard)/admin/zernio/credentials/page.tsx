import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Plus, Server, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

export default async function ZernioCredentialsPage() {
  const supabase = await createClient()
  
  // Verify super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.app_metadata?.is_super_admin) {
    redirect('/dashboard')
  }

  // Fetch credentials
  const { data: credentials, error } = await supabase
    .from('zernio_credentials')
    .select('*')
    .order('priority', { ascending: true })

  // Summary stats
  const total = credentials?.length || 0
  const healthy = credentials?.filter(c => c.status === 'healthy').length || 0
  const rateLimited = credentials?.filter(c => c.status === 'rate_limited').length || 0
  const authError = credentials?.filter(c => c.status === 'authentication_error').length || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Zernio Credentials</h1>
          <p className="text-sm text-gray-500 mt-1">Manage API credentials and load balancing pools.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
          <Plus className="w-4 h-4" />
          Add Credential
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Server className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Healthy</p>
            <p className="text-2xl font-bold text-gray-900">{healthy}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rate Limited</p>
            <p className="text-2xl font-bold text-gray-900">{rateLimited}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Auth Error</p>
            <p className="text-2xl font-bold text-gray-900">{authError}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Key</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
              <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {credentials?.map((cred) => (
              <tr key={cred.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{cred.name}</div>
                  <div className="text-sm text-gray-500">{cred.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 font-mono">••••••••{cred.api_key_encrypted.slice(-4)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${cred.status === 'healthy' ? 'bg-green-100 text-green-800' : ''}
                    ${cred.status === 'rate_limited' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${cred.status === 'authentication_error' ? 'bg-red-100 text-red-800' : ''}
                    ${cred.status === 'disabled' ? 'bg-gray-100 text-gray-800' : ''}
                    ${cred.status === 'unknown' ? 'bg-gray-100 text-gray-600' : ''}
                  `}>
                    {cred.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cred.priority}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                </td>
              </tr>
            ))}
            {(!credentials || credentials.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No Zernio credentials configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
