export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your social media performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Reach</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Engagement</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Connected Accounts</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
        </div>
      </div>
      
      {/* Empty State for Social Accounts */}
      <div className="mt-8 bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900">No social accounts connected</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          Connect your first social channel through Zernio to start publishing and collecting analytics.
        </p>
        <button className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
          Connect Channel
        </button>
      </div>
    </div>
  )
}
