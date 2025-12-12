import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import Navbar from '../layouts/Navbar';
import { courseService } from '../services';

function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect admin to admin dashboard
    if (user?.role === 'admin') {
      window.location.href = '/admin/dashboard';
      return;
    }
    fetchMyCourses();
  }, [user]);

  const fetchMyCourses = async () => {
    try {
      // Call different endpoint based on user role
      const response = user?.role === 'instructor'
        ? await courseService.getInstructorCourses()
        : await courseService.getMyCourses();

      // For learners, the API returns enrollment objects with nested courseId
      // We need to extract the course details
      if (user?.role === 'learner' && response.data.data) {
        // Filter out null courses (in case a course was deleted)
        const enrolledCourses = response.data.data
          .map(enrollment => enrollment.courseId)
          .filter(course => course !== null);
        setCourses(enrolledCourses);
      } else {
        setCourses(response.data.data);
      }
    } catch (err) {
      setError('Failed to load your courses');
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
          <div className="text-xl">Loading your courses...</div>
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
            {user?.role === 'learner' ? 'My Enrolled Courses' : 'My Created Courses'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = user?.role === 'learner'
                ? user?.enrolledCourses?.find(c => c.course === course._id)?.progress || 0
                : null;

              return (
                <div key={course._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                  <div className="h-32 overflow-hidden bg-gray-200 relative group">
                    <img
                      src={course.thumbnail || '/courses/default-course-thumbnail.jpg'}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/600x400?text=Course+Thumbnail';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-0 transition-opacity"></div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {course.level}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                    {user?.role === 'learner' && progress !== null && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {user?.role === 'instructor' && (
                      <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                        <span>{course.enrolledStudents?.length || 0} students</span>
                        <span>₹{course.revenue || 0} revenue</span>
                      </div>
                    )}

                    <Link
                      to={`/course/${course._id}`}
                      className="block w-full bg-primary hover:bg-secondary text-white text-center py-2 rounded transition font-medium"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                {user?.role === 'learner'
                  ? "You haven't enrolled in any courses yet."
                  : "You haven't created any courses yet."}
              </p>
              {user?.role === 'learner' ? (
                <Link
                  to="/courses"
                  className="inline-block bg-primary hover:bg-secondary text-white px-6 py-2 rounded transition font-medium"
                >
                  Browse Courses
                </Link>
              ) : (
                <Link
                  to="/create-course"
                  className="inline-block bg-primary hover:bg-secondary text-white px-6 py-2 rounded transition font-medium"
                >
                  Create Your First Course
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyCourses;
