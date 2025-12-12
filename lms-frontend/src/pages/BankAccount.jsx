import { useState, useEffect } from 'react';
import { useAuth } from '../hooks';
import Navbar from '../layouts/Navbar';
import { bankService } from '../services';

function BankAccount() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await bankService.getBalance();
      setBalance(response.data.data);
    } catch (err) {
      setError('Failed to load bank account details');
      console.error(err);
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
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Bank Account</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-white text-xl mb-4">Account Balance</h2>
            <p className="text-5xl font-bold text-white mb-6">₹{balance?.balance?.toLocaleString() || 0}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white bg-opacity-20 rounded-lg p-4">
              <div>
                <p className="text-white text-sm">Account Number</p>
                <p className="text-white font-mono text-lg">{balance?.accountNumber}</p>
              </div>
              <div>
                <p className="text-white text-sm">Account Type</p>
                <p className="text-white text-lg capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Information</h2>

            <div className="space-y-4">
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">Account Holder</span>
                <span className="font-semibold text-gray-800">{user?.name}</span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold text-gray-800">{user?.email}</span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">Role</span>
                <span className="font-semibold text-gray-800 capitalize">{user?.role}</span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">Account Number</span>
                <span className="font-semibold text-gray-800 font-mono">{balance?.accountNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Current Balance</span>
                <span className="font-semibold text-green-600 text-xl">₹{balance?.balance?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Bank Account Information</h3>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Your bank account was automatically created when you registered</li>
              <li>• Use your bank secret when making transactions</li>
              <li>• {user?.role === 'learner' ? 'Add funds to purchase courses' : 'Validate transactions to receive payments'}</li>
              <li>• All transactions are secure and encrypted</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default BankAccount;
