import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { clearAuth } from '../../store/slices/authSlice';
import { clearTokens } from '../../services/api/axiosInstance';
import {
  MdMenu,
  MdSearch,
  MdNotifications,
  MdPerson,
  MdSettings,
  MdLogout,
  MdKeyboardArrowDown,
} from 'react-icons/md';

const breadcrumbLabels: Record<string, string> = {
  '': 'Dashboard',
  vendors: 'Vendors',
  users: 'Users',
  listings: 'Listings',
  bookings: 'Bookings',
  categories: 'Categories',
  reviews: 'Reviews',
  reports: 'Reports',
  settings: 'Settings',
};

const TopBar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationCount] = useState(3);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearTokens();
    dispatch(clearAuth());
    navigate('/login');
  };

  const getBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return [{ label: 'Dashboard', path: '/' }];

    const crumbs = [{ label: 'Dashboard', path: '/' }];
    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const label = breadcrumbLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({ label, path: currentPath });
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-neutral-100 shadow-sticky">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-2 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
          >
            <MdMenu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center relative">
            <MdSearch className="absolute left-3 w-4 h-4 text-neutral-300" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-100 rounded-lg text-sm text-neutral-600 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors">
            <MdNotifications className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-2xs font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xs font-semibold">
                    {user?.firstName?.[0] || 'A'}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-neutral-600">
                {user ? `${user.firstName} ${user.lastName}` : 'Admin'}
              </span>
              <MdKeyboardArrowDown className="hidden md:block w-4 h-4 text-neutral-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-2 animate-fade-in">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-600">
                    {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                  </p>
                  <p className="text-xs text-neutral-400">{user?.email || 'admin@events.com'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
                >
                  <MdPerson className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
                >
                  <MdSettings className="w-4 h-4" />
                  Settings
                </button>
                <div className="border-t border-neutral-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-500 hover:bg-error-50 transition-colors"
                  >
                    <MdLogout className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 lg:px-6 pb-2">
        <nav className="flex items-center text-xs text-neutral-400">
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.path} className="flex items-center">
              {idx > 0 && <span className="mx-2">/</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-neutral-600 font-medium">{crumb.label}</span>
              ) : (
                <button
                  onClick={() => navigate(crumb.path)}
                  className="hover:text-primary-500 transition-colors"
                >
                  {crumb.label}
                </button>
              )}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default TopBar;
