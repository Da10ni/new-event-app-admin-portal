import type { ComponentType } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setSidebarCollapsed } from '../../store/slices/uiSlice';
import { APP_NAME } from '../../config/constants';
import {
  MdDashboard,
  MdStore,
  MdPeople,
  MdGridView,
  MdCalendarMonth,
  MdCategory,
  MdStar,
  MdBarChart,
  MdSettings,
  MdClose,
  MdLogout,
} from 'react-icons/md';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  MdDashboard,
  MdStore,
  MdPeople,
  MdGridView,
  MdCalendarMonth,
  MdCategory,
  MdStar,
  MdBarChart,
  MdSettings,
};

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [{ label: 'Dashboard', path: '/', icon: 'MdDashboard' }],
  },
  {
    title: 'Management',
    items: [
      { label: 'Vendors', path: '/vendors', icon: 'MdStore' },
      { label: 'Users', path: '/users', icon: 'MdPeople' },
      { label: 'Listings', path: '/listings', icon: 'MdGridView' },
      { label: 'Bookings', path: '/bookings', icon: 'MdCalendarMonth' },
      { label: 'Categories', path: '/categories', icon: 'MdCategory' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Reviews', path: '/reviews', icon: 'MdStar' },
      { label: 'Reports', path: '/reports', icon: 'MdBarChart' },
    ],
  },
  {
    title: 'Settings',
    items: [{ label: 'Settings', path: '/settings', icon: 'MdSettings' }],
  },
];

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const closeMobileSidebar = () => {
    if (window.innerWidth < 1024) {
      dispatch(setSidebarCollapsed(true));
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-neutral-700 text-white flex flex-col
          transition-transform duration-300 ease-in-out shadow-sidebar
          lg:translate-x-0 lg:z-30
          ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-600 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-base tracking-tight">{APP_NAME}</span>
          </div>
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden text-neutral-300 hover:text-white"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-4 mb-2 text-2xs font-semibold uppercase tracking-widest text-neutral-400">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const IconComponent = iconMap[item.icon];
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={closeMobileSidebar}
                        className={
                          isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'
                        }
                      >
                        {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0" />}
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-neutral-600 p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.firstName}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {user?.firstName?.[0] || 'A'}
                  {user?.lastName?.[0] || 'D'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
              </p>
              <p className="text-2xs text-neutral-400 truncate">
                {user?.role || 'Administrator'}
              </p>
            </div>
            <button
              className="text-neutral-400 hover:text-white transition-colors"
              title="Logout"
            >
              <MdLogout className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
