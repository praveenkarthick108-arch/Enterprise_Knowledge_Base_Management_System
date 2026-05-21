import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HomeIcon, DocumentTextIcon, FolderIcon, TagIcon, MagnifyingGlassIcon,
  ClipboardDocumentCheckIcon, BookmarkIcon, UsersIcon, ChartBarIcon,
  UserCircleIcon, ArrowRightOnRectangleIcon, Bars3Icon, BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group
      ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`
    }
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {!collapsed && <span className="truncate">{label}</span>}
  </NavLink>
);

export default function Sidebar({ open, onToggle }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role?.name;
  const collapsed = !open;

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) {}
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const nav = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard', roles: null },
    { to: '/articles', icon: DocumentTextIcon, label: 'Knowledge Base', roles: null },
    { to: '/articles/my', icon: DocumentTextIcon, label: 'My Articles', roles: ['admin', 'author'] },
    { to: '/articles/create', icon: DocumentTextIcon, label: 'New Article', roles: ['admin', 'author'] },
    { to: '/search', icon: MagnifyingGlassIcon, label: 'Search', roles: null },
    { to: '/bookmarks', icon: BookmarkIcon, label: 'Bookmarks', roles: null },
    { to: '/approvals', icon: ClipboardDocumentCheckIcon, label: 'Approval Queue', roles: ['admin', 'reviewer'] },
    { to: '/categories', icon: FolderIcon, label: 'Categories', roles: ['admin'] },
    { to: '/tags', icon: TagIcon, label: 'Tags', roles: ['admin', 'author'] },
    { to: '/users', icon: UsersIcon, label: 'Users', roles: ['admin'] },
    { to: '/analytics', icon: ChartBarIcon, label: 'Analytics', roles: ['admin', 'reviewer'] },
    { to: '/reports',   icon: ChartBarIcon, label: 'ETL Reports', roles: ['admin', 'reviewer'] },
    { to: '/profile', icon: UserCircleIcon, label: 'Profile', roles: null },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-sidebar flex flex-col transition-all duration-300 z-50 shadow-xl ${open ? 'w-64' : 'w-16'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-indigo-800">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <BuildingOfficeIcon className="w-5 h-5 text-white" />
        </div>
        {open && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">Enterprise KB</p>
            <p className="text-indigo-300 text-xs">Knowledge Management</p>
          </div>
        )}
      </div>

      {/* User info */}
      {open && user && (
        <div className="px-4 py-3 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <span className="text-xs bg-indigo-600 text-indigo-100 px-2 py-0.5 rounded-full capitalize">{role}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.filter(item => !item.roles || item.roles.includes(role)).map(item => (
          <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} collapsed={collapsed} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-indigo-800">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-indigo-200 hover:bg-red-600 hover:text-white transition-colors text-sm font-medium">
          <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
          {open && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
