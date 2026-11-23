'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Logo = () => (
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield */}
        <path d="M20 3 L34 9 L34 20 C34 28 20 37 20 37 C20 37 6 28 6 20 L6 9 Z" fill="url(#shieldGrad)" />
        {/* Cross */}
        <rect x="17" y="12" width="6" height="16" rx="1.5" fill="white" opacity="0.95" />
        <rect x="12" y="17" width="16" height="6" rx="1.5" fill="white" opacity="0.95" />
        {/* Water drops on shield */}
        <circle cx="20" cy="20" r="3.5" fill="url(#pulseGrad)" opacity="0.3" />
        <defs>
          <linearGradient id="shieldGrad" x1="20" y1="3" x2="20" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="pulseGrad" x1="20" y1="3" x2="20" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div>
      <h1 className="text-lg sm:text-xl font-bold leading-tight tracking-wide">JeevanDhara</h1>
      <p className="text-[10px] text-white/70 leading-none hidden sm:block tracking-widest uppercase">AI Health Surveillance</p>
    </div>
  </div>
);

export default function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center justify-between">
            <Logo />
            <button className="sm:hidden text-white" onClick={() => document.getElementById('mobile-menu').classList.toggle('hidden')}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div id="mobile-menu" className="hidden sm:flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <Link href="/dashboard" className="px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium text-sm sm:text-base backdrop-blur">
                📊 Dashboard
              </Link>
              <Link href="/submit-report" className="px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium text-sm sm:text-base backdrop-blur">
                📝 Submit Report
              </Link>
              <Link href="/prediction" className="px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium text-sm sm:text-base backdrop-blur flex items-center gap-2">
                🔮 Predict Risk
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/20">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-lg">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-xs text-white/80">{user.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto bg-white/20 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 text-sm font-medium"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
