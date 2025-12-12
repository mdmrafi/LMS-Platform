import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'learner',
    bankAccountSecret: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Animated label effect
  useEffect(() => {
    const labels = document.querySelectorAll('.input-group label');
    labels.forEach((label) => {
      const text = label.innerText;
      label.innerHTML = text
        .split('')
        .map((letter, idx) => {
          return `<span style="transition-delay:${idx * 50}ms" class="letter">${letter}</span>`;
        })
        .join('');
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Submitting registration with data:', formData);

    try {
      const response = await authService.register(formData);

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));

      // Redirect to login or dashboard
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      // Show detailed error message
      const errorMsg = err.response?.data?.message ||
        err.response?.data?.errors?.map(e => e.msg).join(', ') ||
        'Registration failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-8">
      <div className="container-box relative bg-accent bg-opacity-40 w-full max-w-md rounded-3xl shadow-2xl p-8">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="input-group relative">
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b-2 border-gray-600 text-white text-base pb-2 focus:outline-none focus:border-blue-300 transition-colors"
            />
            <label className="absolute top-0 left-0 text-white text-lg pointer-events-none">
              Full Name
            </label>
          </div>

          <div className="input-group relative">
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b-2 border-gray-600 text-white text-base pb-2 focus:outline-none focus:border-blue-300 transition-colors"
            />
            <label className="absolute top-0 left-0 text-white text-lg pointer-events-none">
              Email
            </label>
          </div>

          <div className="input-group relative">
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b-2 border-gray-600 text-white text-base pb-2 focus:outline-none focus:border-blue-300 transition-colors"
            />
            <label className="absolute top-0 left-0 text-white text-lg pointer-events-none">
              Password
            </label>
          </div>

          <div className="input-group relative">
            <input
              type="password"
              name="bankAccountSecret"
              required
              value={formData.bankAccountSecret}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b-2 border-gray-600 text-white text-base pb-2 focus:outline-none focus:border-blue-300 transition-colors"
            />
            <label className="absolute top-0 left-0 text-white text-lg pointer-events-none">
              Bank Secret
            </label>
          </div>

          {/* Role is always learner - instructors and admins are pre-created */}
          <input type="hidden" name="role" value="learner" />

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary bg-opacity-70 hover:bg-secondary hover:bg-opacity-70 text-white text-lg font-medium py-3 rounded-lg transition-all hover:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-white">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-300 hover:text-blue-200 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .input-group input:focus + label .letter,
        .input-group input:valid + label .letter {
          color: lightblue;
          transform: translateY(-30px);
        }

        .letter {
          display: inline-block;
          transition: 0.3s cubic-bezier(0.68, -0.55, 0.255, 1.55);
        }

        .container-box {
          box-shadow: 10px 10px 15px #035d65;
        }
      `}</style>
    </div>
  );
}

export default Register;
