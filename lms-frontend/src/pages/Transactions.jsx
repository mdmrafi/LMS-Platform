import { useState, useEffect } from 'react';
import Navbar from '../layouts/Navbar';
import { transactionAPI } from '../api';
import { useAuth } from '../hooks';

function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getPendingTransactions();
      setTransactions(response.data.data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (transactionId, validationToken) => {
    const bankSecret = prompt('Enter your bank account secret to claim this payment:');
    if (!bankSecret) return;

    setValidating(transactionId);
    try {
      await transactionAPI.validateTransaction(transactionId, {
        validationToken: validationToken,
        bankAccountSecret: bankSecret
      });
      alert('Transaction validated successfully! Payment claimed.');
      fetchTransactions(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Validation failed');
    } finally {
      setValidating(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading transactions...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Pending Transactions</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Your Share (70%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validation Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const instructorShare = Math.floor(transaction.amount * 0.7);
                  
                  return (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {transaction.transactionId?.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.course?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.learner?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ৳{(transaction.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ৳{(instructorShare / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-700">
                        <span className="bg-blue-50 px-2 py-1 rounded text-xs">
                          {transaction.validationToken?.substring(0, 12)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleValidate(transaction._id, transaction.validationToken)}
                          disabled={validating === transaction._id}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
                        >
                          {validating === transaction._id ? 'Validating...' : 'Validate & Claim'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No pending transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Transactions;
