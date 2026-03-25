import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Moon, Sun, Menu, X, Home, Package, ShoppingBag, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';
import SettingsModal from '../components/SettingsModal';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
  ];

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const savedAvatar = user?.avatar_url || null;

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-transparent dark:bg-gradient-to-br dark:from-gray-900 dark:via-rose-900 dark:to-gray-900 transition-colors relative overflow-hidden">
      {/* Animated Background Elements - Only in Dark Mode, only on desktop */}
      <div className="fixed inset-0 pointer-events-none dark:hidden-mobile hidden md:dark:block">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 glass-effect shadow-xl shadow-primary-500/10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-3xl"
              >
                🎁
              </motion.div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Artify Aura
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === link.to
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/50 scale-105'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-primary-200 dark:hover:bg-gray-700 hover:scale-105'
                  }`}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}
              {isAuthenticated && !isAdmin && (
                <Link
                  to="/orders"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === '/orders'
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/50 scale-105'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-primary-200 dark:hover:bg-gray-700 hover:scale-105'
                  }`}
                >
                  <ShoppingBag size={18} />
                  <span>My Orders</span>
                </Link>
              )}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === '/admin'
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/50 scale-105'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-primary-200 dark:hover:bg-gray-700 hover:scale-105'
                  }`}
                >
                  <User size={18} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <Link to="/cart" className="relative p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 glow-effect">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse-slow"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Profile Avatar with Dropdown (authenticated) or Login button */}
              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <motion.button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-sm font-bold flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 hover:shadow-primary-500/50 hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 overflow-hidden"
                    aria-label="Profile menu"
                  >
                    {savedAvatar
                      ? <img src={savedAvatar} alt="avatar" className="w-full h-full object-cover" />
                      : getInitials()
                    }
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-100 dark:border-gray-600">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {savedAvatar
                                ? <img src={savedAvatar} alt="avatar" className="w-full h-full object-cover" />
                                : getInitials()
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="py-1">
                          <DropdownItem icon={<User size={15} />} label="Profile" onClick={() => navigate('/dashboard')} />
                          {!isAdmin && (
                            <DropdownItem icon={<ShoppingBag size={15} />} label="My Orders" onClick={() => navigate('/orders')} />
                          )}
                          {isAdmin && (
                            <DropdownItem icon={<LayoutDashboard size={15} />} label="Admin Panel" onClick={() => navigate('/admin')} />
                          )}
                          <DropdownItem icon={<Settings size={15} />} label="Settings" onClick={() => { setDropdownOpen(false); setSettingsOpen(true); }} />
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                          >
                            <LogOut size={15} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:block px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 glow-effect animate-shimmer"
                >
                  Login
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-200 dark:hover:bg-gray-700 transition-all duration-300"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-primary-200 dark:border-gray-700 animate-slide-down"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-pink-100 dark:hover:bg-gray-800"
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  {!isAdmin && (
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-200 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      <ShoppingBag size={18} />
                      <span>My Orders</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-200 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      <User size={18} />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg text-center shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">{children}</main>

      <Footer />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-primary-200 dark:border-gray-700 z-50 shadow-2xl shadow-primary-500/20">
        <div className="flex justify-around items-center py-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === link.to
                  ? 'text-primary-600 dark:text-primary-400 scale-110'
                  : 'text-gray-600 dark:text-gray-300 hover:scale-105'
              }`}
            >
              <link.icon size={20} />
              <span className="text-xs">{link.label}</span>
            </Link>
          ))}
          <Link
            to="/cart"
            className="flex flex-col items-center space-y-1 px-4 py-2 rounded-lg relative transition-all duration-300 hover:scale-105 text-gray-600 dark:text-gray-300"
          >
            <ShoppingCart size={20} />
            <span className="text-xs">Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse-slow shadow-lg">
                {cartCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin' : '/orders'}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                location.pathname === (isAdmin ? '/admin' : '/orders')
                  ? 'text-primary-600 dark:text-primary-400 scale-110'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {isAdmin ? <User size={20} /> : <ShoppingBag size={20} />}
              <span className="text-xs">{isAdmin ? 'Admin' : 'Orders'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-gray-600 dark:text-gray-300"
            >
              <User size={20} />
              <span className="text-xs">Login</span>
            </Link>
          )}
        </div>
      </div>

      <div className="md:hidden h-20"></div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function DropdownItem({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
