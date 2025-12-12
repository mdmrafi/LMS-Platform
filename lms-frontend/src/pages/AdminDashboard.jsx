import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import api from '../api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {stats && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-primary">{stats.users.total}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="mr-4">Learners: {stats.users.learners}</span>
                    <span>Instructors: {stats.users.instructors}</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Total Courses</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.courses.total}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    Active: {stats.courses.active}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Transactions</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.transactions.total}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="mr-4">Pending: {stats.transactions.pending}</span>
                    <span>Completed: {stats.transactions.completed}</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    ৳{(stats.revenue.total / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="bg-primary text-white py-3 px-6 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Manage Users
                  </button>
                  <button
                    onClick={() => navigate('/admin/courses')}
                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Manage Courses
                  </button>
                  <button
                    onClick={() => navigate('/admin/transactions')}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Transactions
                  </button>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Course</th>
                        <th className="text-left py-3 px-4">Learner</th>
                        <th className="text-left py-3 px-4">Instructor</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTransactions.map((transaction) => (
                        <tr key={transaction._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{transaction.course?.title}</td>
                          <td className="py-3 px-4">{transaction.learner?.name}</td>
                          <td className="py-3 px-4">{transaction.instructor?.name}</td>
                          <td className="py-3 px-4">৳{(transaction.amount / 100).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                transaction.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Courses */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Top Courses</h2>
                <div className="space-y-4">
                  {stats.topCourses.map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">{course.title}</h3>
                        <p className="text-sm text-gray-600">
                          Instructor: {course.instructor?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          {course.totalSales} sales
                        </p>
                        <p className="text-sm text-gray-600">
                          ৳{(course.revenue / 100).toFixed(2)} revenue
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
