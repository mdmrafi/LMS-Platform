import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'learner',
  });
  const [localError, setLocalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

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

    // Simple field-level validation
    if (e.target.name === 'email') {
      const emailVal = e.target.value.trim();
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      setFieldErrors((prev) => ({ ...prev, email: emailVal && !isValidEmail ? 'Enter a valid email' : '' }));
    }
    if (e.target.name === 'password') {
      const pwd = e.target.value;
      setFieldErrors((prev) => ({ ...prev, password: pwd && pwd.length < 6 ? 'Minimum 6 characters' : '' }));
    }
    if (e.target.name === 'role') {
      const roleVal = e.target.value;
      setFieldErrors((prev) => ({ ...prev, role: !roleVal ? 'Select a role' : '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    // Final validation before submit
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
    const passwordValid = formData.password && formData.password.length >= 6;
    const roleValid = !!formData.role;

    const newErrors = {
      email: emailValid ? '' : 'Enter a valid email',
      password: passwordValid ? '' : 'Minimum 6 characters',
      role: roleValid ? '' : 'Select a role',
    };
    setFieldErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((msg) => msg);
    if (hasErrors) {
      return; // Do not submit if validation fails
    }
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email, role: formData.role });
      const result = await login(formData);
      console.log('Login result:', result);

      if (result.success) {
        console.log('Login successful, navigating to dashboard...');
        // Learners go to dashboard, instructors/admins to their panels
        const userRole = result.data?.role;
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'instructor') {
          navigate('/instructor/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('Login failed:', result.message);
        setLocalError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sync AuthContext error to local error banner
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="container-box relative bg-accent bg-opacity-40 w-full max-w-md rounded-3xl shadow-2xl p-8">
        <h2 className="text-2xl font-semibold text-white text-center mb-8">
          Please login to continue
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="input-group relative">
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-transparent border-0 border-b-2 text-white text-base pb-2 focus:outline-none transition-colors ${
                fieldErrors.email
                  ? 'border-red-500 focus:border-red-400'
                  : formData.email
                  ? 'border-green-500 focus:border-green-400'
                  : 'border-gray-600 focus:border-blue-300'
              }`}
            />
            <label className="absolute top-0 left-0 text-white text-lg pointer-events-none">
              Email
            </label>
            {fieldErrors.email ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="input-group relative">
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full bg-transparent border-0 border-b-2 text-white text-base pb-2 focus:outline-none transition-colors ${
                fieldErrors.password
                  ? 'border-red-500 focus:border-red-400'
                  : formData.password
                  ? 'border-green-500 focus:border-green-400'
                  : 'border-gray-600 focus:border-blue-300'
              }`}
            />
            <label className="absolute top-0 left-0 text-white text-lg pointer-events-none">
              Password
            </label>
            {fieldErrors.password ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.password}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-white text-sm font-medium">Login As</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full bg-accent bg-opacity-60 border-2 text-white text-base py-2 px-3 rounded focus:outline-none transition-colors ${
                fieldErrors.role
                  ? 'border-red-500 focus:border-red-400'
                  : formData.role
                  ? 'border-green-500 focus:border-green-400'
                  : 'border-gray-600 focus:border-blue-300'
              }`}
            >
              <option value="learner" className="bg-accent">Learner</option>
              <option value="instructor" className="bg-accent">Instructor</option>
              <option value="admin" className="bg-accent">Admin</option>
            </select>
            {fieldErrors.role ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.role}</p>
            ) : null}
          </div>

          {localError ? (
            <div role="alert" aria-live="assertive" className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-2 rounded">
              {localError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || !!fieldErrors.email || !!fieldErrors.password || !!fieldErrors.role}
            className="w-full bg-primary bg-opacity-70 hover:bg-secondary hover:bg-opacity-70 text-white text-lg font-medium py-3 rounded-lg transition-all hover:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-white">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-300 hover:text-blue-200 font-medium">
              Register here
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-300">
            Test Account: learner1@example.com / password123
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

export default Login;
