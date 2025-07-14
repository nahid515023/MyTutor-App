// Enhanced shared styles for all dashboard pages with modern glassmorphism design
export const dashboardStyles = {
  // Main container with improved gradient
  container: "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden",
  
  // Content wrapper with better spacing
  content: "p-6 lg:p-8 relative z-10",
  
  // Enhanced header styles with glassmorphism
  header: "mb-8 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 relative overflow-hidden hover:shadow-2xl transition-all duration-500",
  headerGradient: "absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10",
  headerContent: "relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4",
  
  // Enhanced title styles with better responsiveness
  title: "text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2",
  subtitle: "text-slate-600 text-lg lg:text-xl max-w-2xl",
  
  // Enhanced button styles
  refreshButton: "flex items-center gap-2 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70 px-6 py-2 rounded-lg",
  actionButton: "hover:shadow-lg transition-all duration-300 px-4 py-2 rounded-lg font-medium",
  deleteButton: "bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 hover:shadow-lg",
  
  // Enhanced card styles with better animations
  card: "group shadow-2xl border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl rounded-2xl overflow-hidden",
  cardContent: "p-8",
  cardHeader: "border-b border-slate-200/50 pb-6 bg-gradient-to-r from-transparent to-slate-50/50",
  
  // Enhanced stat card styles
  statCard: "group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:-translate-y-2 rounded-2xl overflow-hidden",
  statContent: "p-8",
  statTitle: "text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider",
  statValue: "text-4xl font-bold text-slate-900 mb-3",
  statChange: "text-sm font-semibold",
  statIcon: "p-5 rounded-3xl bg-opacity-20 group-hover:scale-110 transition-transform duration-300",
  
  // Enhanced gradient cards with better shadows
  gradientCard: "group border-0 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 rounded-2xl overflow-hidden",
  gradientContent: "p-8 relative",
  gradientTitle: "text-sm font-semibold uppercase tracking-wider mb-2 text-white/90",
  gradientValue: "text-4xl font-bold mb-2 text-white",
  gradientSubtext: "text-sm text-white/80",
  gradientIcon: "h-12 w-12 group-hover:scale-110 transition-transform duration-300 text-white/80",
  
  // Enhanced chart card styles
  chartCard: "group shadow-2xl border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-500 hover:-translate-y-1 rounded-2xl overflow-hidden",
  chartHeader: "border-b border-slate-200/50 pb-6 bg-gradient-to-r from-transparent to-slate-50/30",
  chartTitle: "text-xl font-bold text-slate-800",
  chartIconWrapper: "p-3 rounded-xl mr-3 transition-all duration-300 group-hover:scale-110",
  chartContent: "pt-8",
  
  // Enhanced table styles
  table: "group shadow-2xl border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-500 hover:-translate-y-1 rounded-2xl overflow-hidden",
  tableHeader: "border-b border-slate-200/50 pb-6 bg-gradient-to-r from-transparent to-slate-50/30",
  tableContent: "p-8",
  tableRow: "group/item hover:bg-slate-50/50 rounded-lg p-3 -m-3 transition-all duration-300 border-b border-slate-200/30 last:border-b-0 hover:shadow-md",
  
  // Enhanced filter section
  filterCard: "shadow-2xl border-0 bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden mb-6",
  filterContent: "p-6",
  filterTitle: "text-lg font-bold text-slate-800 mb-2",
  filterDescription: "text-slate-600 text-sm mb-6",
  filterGrid: "flex gap-4 flex-wrap",
  
  // Enhanced summary cards
  summaryCard: "shadow-2xl border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden",
  summaryContent: "p-6",
  summaryIcon: "h-5 w-5 text-muted-foreground",
  summaryValue: "text-2xl font-bold",
  summaryLabel: "text-xs text-muted-foreground uppercase tracking-wider",
  
  // Enhanced activity styles
  activityItem: "group/item flex items-center justify-between border-b border-slate-200/30 pb-4 last:border-b-0 hover:bg-slate-50/50 rounded-lg p-3 -m-3 transition-all duration-300 hover:shadow-sm",
  activityText: "text-sm font-semibold text-slate-700 group-hover/item:text-slate-900 transition-colors duration-300",
  activityBadges: "flex items-center mt-2 space-x-3",
  activityDate: "text-xs text-slate-500 font-medium",
  
  // Enhanced badge styles
  badge: "text-xs font-medium rounded-full px-3 py-1",
  badgeVerified: "text-xs text-green-600 border-green-200 bg-green-50 font-medium rounded-full px-3 py-1",
  badgeSuccess: "bg-green-100 text-green-700 border border-green-200",
  badgeWarning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  badgeError: "bg-red-100 text-red-700 border border-red-200",
  badgeInfo: "bg-blue-100 text-blue-700 border border-blue-200",
  
  // Enhanced input styles
  input: "rounded-lg border-slate-200 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-300",
  searchInput: "pl-10 rounded-lg border-slate-200 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-300",
  
  // Tooltip styles
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(226, 232, 240, 0.3)',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  
  // Grid layouts
  statsGrid: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8",
  quickStatsGrid: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",
  summaryGrid: "grid grid-cols-1 md:grid-cols-3 gap-6",
  chartGrid: "grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8",
  
  // Loading styles
  loading: "flex items-center justify-center min-h-screen",
  loadingSpinner: "animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600",
  
  // Error styles
  error: "flex items-center justify-center min-h-screen",
  errorContent: "text-center",
  errorIcon: "h-12 w-12 text-red-500 mx-auto mb-4",
  errorText: "text-gray-500",
  
  // Icon background colors
  iconBgs: {
    blue: "bg-blue-100 group-hover:bg-blue-200",
    green: "bg-green-100 group-hover:bg-green-200",
    purple: "bg-purple-100 group-hover:bg-purple-200",
    orange: "bg-orange-100 group-hover:bg-orange-200",
    red: "bg-red-100 group-hover:bg-red-200",
    yellow: "bg-yellow-100 group-hover:bg-yellow-200"
  },
  
  // Gradient backgrounds
  gradients: {
    blue: "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700",
    green: "bg-gradient-to-br from-green-500 via-green-600 to-green-700",
    purple: "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700",
    orange: "bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600",
    red: "bg-gradient-to-br from-red-400 via-red-500 to-red-600"
  }
}

// Color schemes for different dashboard elements
export const dashboardColors = {
  primary: {
    blue: '#3B82F6',
    green: '#10B981',
    purple: '#8B5CF6',
    orange: '#F59E0B',
    red: '#EF4444'
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8'
  },
  background: {
    light: 'rgba(255, 255, 255, 0.7)',
    lighter: 'rgba(255, 255, 255, 0.9)',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  }
}

// Common animation classes
export const animations = {
  fadeIn: "animate-in fade-in duration-500",
  slideUp: "animate-in slide-in-from-bottom-4 duration-500",
  scaleIn: "animate-in zoom-in-95 duration-300",
  hover: "transition-all duration-300 hover:scale-105",
  hoverShadow: "transition-all duration-300 hover:shadow-lg",
  cardHover: "transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
}
