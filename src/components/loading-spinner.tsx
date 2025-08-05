export function LoadingSpinner() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Loading Map</h3>
          <p className="text-sm text-gray-500">Initializing interactive components...</p>
        </div>
      </div>
    </div>
  )
}
