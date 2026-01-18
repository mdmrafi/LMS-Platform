import { useState, useEffect } from 'react';
import { useAuth } from '../hooks';
import Navbar from '../layouts/Navbar';
import { bankService } from '../services';

function BankAccount() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [addingFunds, setAddingFunds] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setAddingFunds(true);

    try {
      const amount = parseFloat(addFundsAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        setAddingFunds(false);
        return;
      }

      const response = await bankService.addFunds(amount);
      setBalance(prev => ({
        ...prev,
        balance: response.data.data.newBalance
      }));
      setSuccessMessage(`Successfully added ₹${amount.toLocaleString()} to your account!`);
      setAddFundsAmount('');
      setTimeout(() => {
        setShowAddFundsModal(false);
        setSuccessMessage('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add funds');
    } finally {
      setAddingFunds(false);
    }
  };

  const presetAmounts = [1000, 5000, 10000, 25000, 50000];

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

          {error && !showAddFundsModal && (
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

            {/* Add Funds Button - Only for learners */}
            {user?.role === 'learner' && (
              <button
                onClick={() => setShowAddFundsModal(true)}
                className="mt-6 w-full md:w-auto bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition shadow-md"
              >
                💰 Add Funds
              </button>
            )}
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

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Funds</h2>
              <button
                onClick={() => {
                  setShowAddFundsModal(false);
                  setError('');
                  setSuccessMessage('');
                  setAddFundsAmount('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-sm">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleAddFunds}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-lg"
                  required
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setAddFundsAmount(amount.toString())}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        addFundsAmount === amount.toString()
                          ? 'bg-primary text-white border-primary'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      ₹{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Maximum single deposit: ₹1,00,000
              </p>

              <button
                type="submit"
                disabled={addingFunds || !addFundsAmount}
                className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
              >
                {addingFunds ? 'Processing...' : `Add ₹${addFundsAmount ? parseFloat(addFundsAmount).toLocaleString() : '0'}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default BankAccount;
