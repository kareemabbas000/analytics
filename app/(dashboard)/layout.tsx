import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, MessageSquare, BarChart3, FileText, Settings, LogOut, CheckCircle2 } from 'lucide-react'
import { logout } from '@/app/login/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if super admin
  const isSuperAdmin = user.app_metadata?.is_super_admin === true

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">Z</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Zernio SaaS</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <LayoutDashboard className="w-5 h-5 text-gray-400" />
            Dashboard
          </Link>
          <Link href="/social-accounts" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <Users className="w-5 h-5 text-gray-400" />
            Social Accounts
          </Link>
          <Link href="/content" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <CheckCircle2 className="w-5 h-5 text-gray-400" />
            Content
          </Link>
          <Link href="/inbox" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            Inbox
          </Link>
          <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            Analytics
          </Link>
          <Link href="/reports" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <FileText className="w-5 h-5 text-gray-400" />
            Reports
          </Link>

          {isSuperAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
              </div>
              <Link href="/admin/zernio/credentials" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                <Settings className="w-5 h-5 text-gray-400" />
                Zernio Config
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <LogOut className="w-5 h-5 text-gray-400" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 md:hidden">
            <span className="text-lg font-semibold text-gray-900">Zernio SaaS</span>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
