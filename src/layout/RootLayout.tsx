import { Outlet, Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function RootLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar with Dynamic Menu */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold">Expense Tracker</h2>
        </div>
        
        <nav className="px-4 space-y-1">
          {user?.menus.map((menu) => (
            <Link
              key={menu.key}
              to={menu.path}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {menu.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">
              Welcome, {user?.userName || 'User'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.currency || 'JPY'}
              </span>
              <button
                onClick={() => logout()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
