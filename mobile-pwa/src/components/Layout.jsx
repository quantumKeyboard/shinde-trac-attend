import { Outlet, NavLink } from 'react-router-dom';
import { Home, Users, Calendar, LogOut } from 'lucide-react';
import { signOut } from '../services/supabase';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Layout() {
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      clearAuth();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg safe-area-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">ST Attendance</h1>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-primary-700 rounded-lg transition-colors touch-target"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
        <div className="flex justify-around">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center py-3 px-4 touch-target transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-600'
              }`
            }
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Attendance</span>
          </NavLink>

          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `flex flex-col items-center py-3 px-4 touch-target transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-600'
              }`
            }
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Employees</span>
          </NavLink>

          <NavLink
            to="/working-days"
            className={({ isActive }) =>
              `flex flex-col items-center py-3 px-4 touch-target transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-600'
              }`
            }
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs mt-1">Working Days</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
