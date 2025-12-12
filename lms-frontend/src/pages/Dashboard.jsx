import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import Navbar from '../layouts/Navbar';
import { userService, bankService } from '../services';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect admin to admin dashboard
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const balanceRes = await bankService.getBalance();
      setBalance(balanceRes.data.data.balance);

      // Set simple stats based on user data
      setStats({
        enrolledCourses: user?.enrolledCourses?.length || 0,
        createdCourses: user?.createdCourses?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Welcome, {user?.name}!
          </h1>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-white text-lg mb-2">Bank Balance</h2>
            <p className="text-4xl font-bold text-white">₹{balance?.toLocaleString() || 0}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {user?.role === 'learner' && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm mb-2">Enrolled Courses</h3>
                  <p className="text-3xl font-bold text-primary">{stats?.enrolledCourses || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm mb-2">Completed Courses</h3>
                  <p className="text-3xl font-bold text-green-600">{stats?.completedCourses || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm mb-2">Certificates Earned</h3>
                  <p className="text-3xl font-bold text-yellow-600">{stats?.certificates || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm mb-2">Total Spent</h3>
                  <p className="text-3xl font-bold text-red-600">₹{stats?.totalSpent || 0}</p>
                </div>
              </>
            )}

            {user?.role === 'instructor' && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm mb-2">Total Courses</h3>
                  <p className="text-3xl font-bold text-primary">{stats?.totalCourses || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm mb-2">Total Students</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats?.totalStudents || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">₹{stats?.totalRevenue || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm mb-2">Pending Claims</h3>
                  <p className="text-3xl font-bold text-yellow-600">{stats?.pendingTransactions || 0}</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user?.role === 'learner' && (
                <>
                  <a
                    href="/courses"
                    className="bg-primary hover:bg-secondary text-white text-center py-4 rounded-lg transition font-medium"
                  >
                    Browse Courses
                  </a>
                  <a
                    href="/my-courses"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-center py-4 rounded-lg transition font-medium"
                  >
                    My Enrolled Courses
                  </a>
                  <a
                    href="/bank-account"
                    className="bg-green-500 hover:bg-green-600 text-white text-center py-4 rounded-lg transition font-medium"
                  >
                    Manage Bank Account
                  </a>
                </>
              )}

              {user?.role === 'instructor' && (
                <>
                  <a
                    href="/create-course"
                    className="bg-primary hover:bg-secondary text-white text-center py-4 rounded-lg transition font-medium"
                  >
                    Create New Course
                  </a>
                  <a
                    href="/transactions"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-center py-4 rounded-lg transition font-medium"
                  >
                    View Transactions
                  </a>
                  <a
                    href="/my-courses"
                    className="bg-green-500 hover:bg-green-600 text-white text-center py-4 rounded-lg transition font-medium"
                  >
                    My Created Courses
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
