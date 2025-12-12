import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import { courseAPI } from '../api';
import { useAuth } from '../hooks';

function CreateCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    level: 'Beginner',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      const courseData = {
        ...formData,
        price: parseInt(formData.price),
        duration: parseInt(formData.duration),
      };

      await courseAPI.createCourse(courseData);
      alert('Course created successfully! You received ₹5000 reward.');
      navigate('/my-courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Course</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                  placeholder="e.g., Introduction to React"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Description *</label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                  placeholder="Describe what students will learn..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                    placeholder="2999"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Duration (hours) *</label>
                  <input
                    type="number"
                    name="duration"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Category *</label>
                  <input
                    type="text"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                    placeholder="e.g., Programming"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-blue-800 text-sm">
                  💡 You will receive ₹5,000 as a reward for creating this course!
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary text-white py-3 rounded transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Course...' : 'Create Course'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateCourse;
