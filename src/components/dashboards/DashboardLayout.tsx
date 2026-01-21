// ... (keep existing imports)

export function DashboardLayout({ children, sidebar, title, onNavItemClick }: DashboardLayoutProps) {
  // ... (keep existing code)

  return (
    <div className="min-h-screen bg-background">
      {/* ... (keep existing code) */}

      {/* Top navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-card z-50">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSidebarToggle}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Move logo to the right side */}
            <div className="flex-1 flex justify-end">
              <Link to="/" className="flex items-center gap-6">
                <Logo size="md" textSize="md" />
              </Link>
            </div>
          </div>

          <h1 className="hidden md:block text-lg font-display font-semibold">{title}</h1>

          <div className="flex items-center gap-3">
            {/* ... (keep existing notification and profile dropdown code) */}
          </div>
        </div>
      </header>

      {/* ... (keep rest of the component) */}
    </div>
  );
}