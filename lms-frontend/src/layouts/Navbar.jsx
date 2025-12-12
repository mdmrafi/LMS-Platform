import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useEffect, useState } from 'react';

function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [currentRole, setCurrentRole] = useState(user?.role);

    // Force re-render when user role changes
    useEffect(() => {
        setCurrentRole(user?.role);
    }, [user?.role]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-secondary shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link to="/dashboard" className="text-2xl font-bold text-white">
                        LMS Platform
                    </Link>

                    <div className="hidden md:flex space-x-6 items-center">
                        <NavLink to={currentRole === 'admin' ? '/admin/dashboard' : '/dashboard'} className={({ isActive }) => `nav-link text-white hover:text-blue-200 transition ${isActive ? 'active-link' : ''}`}>
                            Dashboard
                        </NavLink>
                        
                        {currentRole === 'admin' ? (
                            <>
                                <NavLink to="/admin/users" className={({ isActive }) => `nav-link text-white hover:text-blue-200 transition ${isActive ? 'active-link' : ''}`}>
                                    Users
                                </NavLink>
                                <NavLink to="/admin/courses" className={({ isActive }) => `nav-link text-white hover:text-blue-200 transition ${isActive ? 'active-link' : ''}`}>
                                    Courses
                                </NavLink>
                                <NavLink to="/admin/transactions" className={({ isActive }) => `nav-link text-white hover:text-blue-200 transition ${isActive ? 'active-link' : ''}`}>
                                    Transactions
                                </NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink to="/courses" className={({ isActive }) => `nav-link text-white hover:text-blue-200 transition ${isActive ? 'active-link' : ''}`}>
                                    All Courses
                                </NavLink>
                                <NavLink to="/my-courses" className={({ isActive }) => `nav-link text-white hover:text-blue-200 transition ${isActive ? 'active-link' : ''}`}>
                                    My Courses
                                </NavLink>
                                {currentRole === 'instructor' && (
                                    <>
                                        <NavLink to="/create-course" className={({ isActive }) => `nav-link text-white hover:text-blue-200 transition ${isActive ? 'active-link' : ''}`}>
                                            Create Course
                                        </NavLink>
                                        <NavLink to="/transactions" className={({ isActive }) => `nav-link text-white hover:text-blue-200 transition ${isActive ? 'active-link' : ''}`}>
                                            Transactions
                                        </NavLink>
                                    </>
                                )}
                                <NavLink to="/bank-account" className={({ isActive }) => `nav-link text-white hover:text-blue-200 transition ${isActive ? 'active-link' : ''}`}>
                                    Bank Account
                                </NavLink>
                            </>
                        )}

                        <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white border-opacity-30">
                            <span className="text-white">
                                {user?.name} ({user?.role})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .nav-link {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.255, 1.55);
                }
                
                .nav-link.active-link {
                    background-color: rgba(0, 0, 0, 0.3);
                    transform: translateY(-3px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
                
                .nav-link:hover {
                    transform: translateY(-2px);
                }
                
                .nav-link:active {
                    background-color: rgba(0, 0, 0, 0.4);
                }
            `}</style>
        </nav>
    );
}

export default Navbar;
