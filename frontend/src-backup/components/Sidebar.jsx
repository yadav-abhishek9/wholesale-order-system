import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Tag,
  DollarSign,
  Menu,
  X,
  LogOut,
  Sparkles,
  UserCog
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const adminLinks = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-blue-600' },
  { path: '/admin/products', icon: Package, label: 'Products', color: 'from-purple-500 to-purple-600' },
  { path: '/admin/parties', icon: Users, label: 'Parties', color: 'from-pink-500 to-pink-600' },
  { path: '/admin/party-pricing', icon: Tag, label: 'Party Pricing', color: 'from-orange-500 to-orange-600' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', color: 'from-green-500 to-green-600' },
  { path: '/admin/payments', icon: DollarSign, label: 'Payments', color: 'from-emerald-500 to-emerald-600' },
  { path: '/admin/users', icon: UserCog, label: 'Users', color: 'from-indigo-500 to-indigo-600' },
];

  const salesmanLinks = [
    { path: '/salesman/parties', icon: Users, label: 'Search Party', color: 'from-blue-500 to-blue-600' },
    { path: '/salesman/orders', icon: ShoppingCart, label: 'My Orders', color: 'from-green-500 to-green-600' },
  ];

  const links = isAdmin ? adminLinks : salesmanLinks;
  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Wholesale
            </h1>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${
              isAdmin 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileOpen(false)}
              className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                active
                  ? `bg-gradient-to-r ${link.color} text-white shadow-lg scale-105`
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                active 
                  ? 'bg-white/20' 
                  : 'bg-gray-800/50 group-hover:bg-gray-700/50'
              } transition-colors`}>
                <Icon size={20} />
              </div>
              <span className="font-semibold">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3.5 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
        >
          <div className="p-2 rounded-lg bg-gray-800/50 group-hover:bg-red-500/20 transition-colors">
            <LogOut size={20} />
          </div>
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen fixed left-0 top-0 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 w-72 h-screen z-50 shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;