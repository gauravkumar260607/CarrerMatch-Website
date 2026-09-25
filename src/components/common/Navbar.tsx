import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { 
  User, 
  LogOut, 
  LayoutDashboard, 
  Bookmark, 
  PlusCircle, 
  Sparkles, 
  Building2, 
  Search, 
  Database,
  Menu,
  X as CloseIcon,
  ChevronRight
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, meta?: any) => void;
  onOpenAuth: (initialMode?: 'signin' | 'signup') => void;
  onOpenPostJob?: () => void;
  onOpenSupabase?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenPostJob,
  onOpenSupabase
}) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (view: string, meta?: any) => {
    setMobileMenuOpen(false);
    onNavigate(view, meta);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single Wordmark Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="text-left group flex items-center gap-2 focus:outline-none"
        >
          <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <span className="w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              CM
            </span>
            CareerMatch
          </span>
        </button>

        {/* Zone 2: 4-6 Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('jobs')}
            className={`transition-colors flex items-center gap-1.5 ${
              currentView === 'jobs' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4 opacity-70" />
            Explore Jobs
          </button>

          <button
            onClick={() => onNavigate('companies')}
            className={`transition-colors flex items-center gap-1.5 ${
              currentView === 'companies' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 opacity-70" />
            Companies
          </button>

          <button
            onClick={() => onNavigate('ml_hub')}
            className={`transition-colors flex items-center gap-1.5 ${
              currentView === 'ml_hub' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            ML Match & Intelligence
          </button>

          {user && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition-colors flex items-center gap-1.5 ${
                currentView === 'dashboard' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 opacity-70" />
              {user.role === 'admin' ? 'Admin Portal' : user.role === 'recruiter' ? 'Recruiter Hub' : 'My Dashboard'}
            </button>
          )}

          {user?.role === 'job_seeker' && (
            <button
              onClick={() => onNavigate('profile')}
              className={`transition-colors flex items-center gap-1.5 ${
                currentView === 'profile' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 opacity-70" />
              Candidate Profile
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-3">
          {/* Supabase Integration Button */}
          {onOpenSupabase && (
            <button
              onClick={onOpenSupabase}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
              title="Supabase Backend: Connected"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Supabase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}

          {user ? (
            <>
              {/* Recruiter / Admin Quick Post Button */}
              {(user.role === 'recruiter' || user.role === 'admin') && onOpenPostJob && (
                <button
                  onClick={onOpenPostJob}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post a Job
                </button>
              )}

              {/* In-app Notifications */}
              <NotificationDropdown onNavigate={(path) => {
                if (path.includes('applications')) {
                  onNavigate('dashboard');
                } else {
                  onNavigate('jobs');
                }
              }} />

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-100 transition-all focus:outline-none"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden lg:block text-xs font-medium text-slate-700 truncate max-w-[120px]">
                    {user.name}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1.5 divide-y divide-slate-100 animate-in fade-in duration-100">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                        Dashboard
                      </button>

                      {user.role === 'job_seeker' && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onNavigate('profile');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Edit Profile & Resume
                        </button>
                      )}

                      {user.role === 'job_seeker' && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onNavigate('saved_jobs');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                          Saved Jobs
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? (
              <CloseIcon className="w-5 h-5 text-slate-900" />
            ) : (
              <Menu className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => handleMobileNav('home')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'home'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Home Overview</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => handleMobileNav('jobs')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'jobs'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                Explore Career Openings
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => handleMobileNav('companies')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'companies'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                Partner Companies
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => handleMobileNav('ml_hub')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'ml_hub'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                ML Match & Intelligence
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            {user && (
              <button
                onClick={() => handleMobileNav('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  {user.role === 'admin' ? 'Admin Portal' : user.role === 'recruiter' ? 'Recruiter Dashboard' : 'My Student Dashboard'}
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )}

            {user?.role === 'job_seeker' && (
              <>
                <button
                  onClick={() => handleMobileNav('profile')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentView === 'profile'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    Candidate Profile & Resume
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => handleMobileNav('saved_jobs')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentView === 'saved_jobs'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-slate-400" />
                    Bookmarked Jobs
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </>
            )}
          </div>

          {/* Quick Actions for Mobile */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {(user?.role === 'recruiter' || user?.role === 'admin') && onOpenPostJob && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPostJob();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Post a Job Opening
              </button>
            )}

            {onOpenSupabase && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSupabase();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200"
              >
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Supabase Live Connection
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            )}

            {!user ? (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg text-center"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user.name})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
