import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Leaderboard from './pages/Leaderboard';
import Vault from './pages/Vault';
import Scratchpad from './pages/Scratchpad';
import Ratings from './pages/Ratings';
import Messages from './pages/Messages';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LayoutDashboard, BookOpen, CheckSquare, BrainCircuit, MessageSquare, Globe, LogOut, Menu, X, Trophy, FolderHeart, PenTool, Star, Mail } from 'lucide-react';
import './index.css';

const PrivateRoute = ({ children }) => {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/login" />;
};

const AppLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    
    const navItems = [
        { path: '/overview', name: 'Overview', icon: LayoutDashboard },
        { path: '/focus', name: 'Focus Realm', icon: BookOpen },
        { path: '/planner', name: 'Action Planner', icon: CheckSquare },
        { path: '/lounge', name: 'Section Lounge', icon: MessageSquare },
        { path: '/forums', name: 'Global Forums', icon: Globe },
        { path: '/vault', name: 'Digital Vault', icon: FolderHeart },
        { path: '/tutor', name: 'AI Tutor', icon: BrainCircuit },
        { path: '/scratchpad', name: 'Scratchpad', icon: PenTool },
        { path: '/ratings', name: 'Course Ratings', icon: Star },
        { path: '/messages', name: 'Private DMs', icon: Mail },
        { path: '/leaderboard', name: 'Leaderboards', icon: Trophy }
    ];

    const handleNav = (path) => {
        navigate(path);
        setSidebarOpen(false);
    };

    return (
        <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
            )}

            {/* Mobile hamburger */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 60,
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white'
                }}
                className="mobile-hamburger">
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <nav className={`glass-panel sidebar-nav${sidebarOpen ? ' sidebar-open' : ''}`} style={{
                width: '260px', height: '100vh', position: 'fixed', left: sidebarOpen ? 0 : undefined,
                top: 0, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column',
                zIndex: 50, borderRadius: 0, borderRight: '1px solid var(--border-subtle)',
                transition: 'transform 0.3s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', padding: '0 8px' }}>
                    <span style={{ width: 30, height: 30, borderRadius: '8px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white' }}>L</span>
                    <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.3rem', fontFamily: 'Outfit, sans-serif' }}>Lumina<span style={{color: 'var(--accent-blue)'}}>.</span></h2>
                </div>

                {user && (
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>{user.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.college?.substring(0, 28)}{user.college?.length > 28 ? '...' : ''}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--accent-blue)' }}>{user.course} · Sec {user.section}</p>
                    </div>
                )}

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, padding: 0, margin: 0 }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <li
                                key={item.path}
                                onClick={() => handleNav(item.path)}
                                style={{
                                    color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 600 : 400,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    padding: '11px 14px',
                                    borderRadius: '10px',
                                    transition: 'all 0.15s',
                                    fontSize: '0.92rem',
                                    borderLeft: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent'
                                }}
                                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; }}}
                                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
                            >
                                <Icon size={18} />{item.name}
                            </li>
                        );
                    })}
                </ul>

                <button onClick={logout} style={{
                    width: '100%', background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', cursor: 'pointer', padding: '11px', fontSize: '0.9rem'
                }}>
                    <LogOut size={16} /> Log out
                </button>
            </nav>
            
            <main className="main-content" style={{ marginLeft: '260px', flex: 1, padding: '2rem 2.5rem', minHeight: '100vh', overflowY: 'auto' }}>
                <Routes>
                    <Route path="/overview" element={<Dashboard view="overview" />} />
                    <Route path="/focus" element={<Dashboard view="focus" />} />
                    <Route path="/planner" element={<Dashboard view="planner" />} />
                    <Route path="/lounge" element={<Dashboard view="lounge" />} />
                    <Route path="/forums" element={<Dashboard view="forums" />} />
                    <Route path="/vault" element={<Vault />} />
                    <Route path="/tutor" element={<Dashboard view="tutor" />} />
                    <Route path="/scratchpad" element={<Scratchpad />} />
                    <Route path="/ratings" element={<Ratings />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="*" element={<Navigate to="/overview" />} />
                </Routes>
            </main>
        </div>
    );
};

function App() {
  return (
    <AuthProvider>
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/*" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
            </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
