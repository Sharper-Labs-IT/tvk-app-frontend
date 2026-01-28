import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { contentService } from '../../services/contentService';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  List,
  PlusCircle,
  CreditCard,
  Gamepad2,
  Calendar,
  Shield, // Added for Admins
  UserPlus, // Added for Add Admin
  Clock, // Added for Pending Content
  BarChart3, // Added for Analytics Report
  Package, // Added for Products
  ShoppingBag, // Added for Orders
  ArrowRightLeft, // Added for Refunds
} from 'lucide-react';

interface SubNavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface NavItem {
  name: string;
  path?: string;
  icon: React.ElementType;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  {
    name: 'Post Management',
    icon: FileText,
    subItems: [
      { name: 'All Posts', path: '/admin/posts', icon: List },
      { name: 'Pending Review', path: '/admin/posts/pending', icon: Clock },
      { name: 'Add New Post', path: '/admin/posts/create', icon: PlusCircle },
    ],
  },
  {
    name: 'Game Management',
    icon: Gamepad2,
    subItems: [
      { name: 'All Games', path: '/admin/games', icon: List },
      { name: 'Add New Game', path: '/admin/games/create', icon: PlusCircle },
    ],
  },
  {
    name: 'Event Management',
    icon: Calendar,
    subItems: [
      { name: 'All Events', path: '/admin/events', icon: List },
      { name: 'Add New Event', path: '/admin/events/create', icon: PlusCircle },
    ],
  },
  {
    name: 'Product Management',
    icon: Package,
    subItems: [
      { name: 'All Products', path: '/admin/products', icon: List },
      { name: 'Add Product', path: '/admin/products/create', icon: PlusCircle },
    ],
  },
  {
    name: 'Order Management',
    icon: ShoppingBag,
    subItems: [
      { name: 'All Orders', path: '/admin/orders', icon: List },
      { name: 'Refund Requests', path: '/admin/refunds', icon: ArrowRightLeft },
    ],
  },
  {
    name: 'Membership Plans',
    icon: CreditCard,
    subItems: [
      { name: 'View All Plans', path: '/admin/membership', icon: List },
      { name: 'Add New Plan', path: '/admin/membership/create', icon: PlusCircle },
    ],
  },
  // --- UPDATED MEMBER MANAGEMENT ---
  {
    name: 'Member Management',
    icon: Users,
    subItems: [
      { name: 'All Members', path: '/admin/members', icon: Users },
      { name: 'All Admins', path: '/admin/members/admins', icon: Shield },
      { name: 'Add New Admin', path: '/admin/members/admins/create', icon: UserPlus },
    ],
  },
  // --------------------------------
  { name: 'Analytics Report', path: '/admin/reports/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Automatically open the menu if the current path matches a sub-item
  useEffect(() => {
    const activeItem = navItems.find((item) =>
      item.subItems?.some((sub) => location.pathname.startsWith(sub.path))
    );
    if (activeItem) {
      setOpenMenu(activeItem.name);
    }
  }, [location.pathname]);

  // Fetch pending content count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const paginatedData = await contentService.getPending(1);
        if (paginatedData && 'total' in paginatedData) {
          setPendingCount(paginatedData.total || 0);
        }
      } catch (error) {
        // Silently fail - not critical
      }
    };

    fetchPendingCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <>
      <aside className="w-64 min-h-screen bg-tvk-dark-card border-r border-white/10 flex flex-col fixed left-0 top-0 z-20 transition-all duration-300">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <span className="text-xl font-bold text-white tracking-wider">
            TVK <span className="text-gold">ADMIN</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isParentActive = item.subItems
              ? item.subItems.some((sub) => location.pathname === sub.path)
              : location.pathname === item.path;

            const isOpen = openMenu === item.name;

            return (
              <div key={item.name}>
                {item.subItems ? (
                  // Dropdown Parent Item
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isParentActive
                        ? 'text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={20}
                        className={
                          isParentActive ? 'text-gold' : 'text-gray-500 group-hover:text-white'
                        }
                      />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  // Regular Single Item
                  <Link
                    to={item.path!}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      location.pathname === item.path
                        ? 'bg-tvk-accent-gold/10 text-gold border-l-4 border-gold'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={
                        location.pathname === item.path
                          ? 'text-gold'
                          : 'text-gray-500 group-hover:text-white'
                      }
                    />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                )}

                {/* Dropdown Children */}
                {item.subItems && isOpen && (
                  <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mt-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = location.pathname === sub.path;
                      const isPendingReview = sub.path === '/admin/posts/pending';
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                            isSubActive ? 'text-gold bg-white/5' : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <sub.icon size={16} />
                            {sub.name}
                          </div>
                          {isPendingReview && pendingCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 bg-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                              {pendingCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out of the admin panel?"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Log Out"
        cancelText="Cancel"
      />
    </>
  );
};

export default AdminSidebar;
