import { addCredential } from '../actions'
import Link from 'next/link'

export default async function NewCredentialPage({ searchParams }: { searchParams: { error?: string } }) {
  const { error } = await searchParams

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add API Credential</h1>
        <p className="text-sm text-gray-500 mt-1">
          The API key will be securely encrypted before saving to the database.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form action={addCredential} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900">Credential Name</label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            placeholder="e.g. Main Production Key"
          />
        </div>

        <div>
          <label htmlFor="api_key" className="block text-sm font-medium text-gray-900">Zernio API Key</label>
          <input
            type="password"
            name="api_key"
            id="api_key"
            required
            className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            placeholder="zr_..."
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900">Description (Optional)</label>
          <input
            type="text"
            name="description"
            id="description"
            className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            placeholder="Used for primary routing"
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-900">Routing Priority</label>
          <p className="text-xs text-gray-500 mt-1">Lower number means higher priority in the load balancer (e.g. 1 is highest).</p>
          <input
            type="number"
            name="priority"
            id="priority"
            defaultValue="1"
            required
            min="1"
            className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <Link
            href="/admin/zernio/credentials"
            className="px-4 py-2 text-sm font-semibold text-gray-900 hover:text-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            Save Credential
          </button>
        </div>
      </form>
    </div>
  )
}
