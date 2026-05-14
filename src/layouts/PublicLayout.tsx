import { Outlet } from "react-router-dom"

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-palmas-bg flex flex-col">
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            
            <p className="text-gray-500 text-xs">
              © 2026 FeiraTech. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
