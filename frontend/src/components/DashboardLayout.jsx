import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  CreditCard,
  UserCog,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Users, label: 'Parties', path: '/admin/parties' },
    { icon: DollarSign, label: 'Party Pricing', path: '/admin/party-pricing' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: UserCog, label: 'Users', path: '/admin/users' },
  ];

  const salesmanMenuItems = [
    { icon: Users, label: 'Parties', path: '/salesman/parties' },
    { icon: ShoppingCart, label: 'Orders', path: '/salesman/orders' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : salesmanMenuItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full
        bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        w-64 z-40
        shadow-2xl
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-display font-black text-white">Wholesale</h1>
                <p className="text-xs text-gray-400">Management System</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-700">
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-3 border border-purple-500/30">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-purple-300 capitalize">{user?.role}</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 font-semibold
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                text-red-400 hover:bg-red-500/10 hover:text-red-300
                transition-all duration-200 font-semibold"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content with PROPER SPACING */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
        />
      )}
    </div>
  );
};

export default DashboardLayout;