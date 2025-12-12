import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import Navbar from '../layouts/Navbar';
import { courseService, transactionService, certificateService, authService } from '../services';
import MaterialsList from '../components/MaterialsList';
import MaterialUpload from '../components/MaterialUpload';

function CourseDetail() {
  const { user, updateUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [bankSecret, setBankSecret] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEnrolled = user?.enrolledCourses?.some(c => {
    const enrolledId = c.courseId || c.course;
    return enrolledId && (enrolledId.toString() === id || enrolledId._id?.toString() === id);
  });

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      const response = await courseService.getCourse(id);
      setCourse(response.data.data);
    } catch (err) {
      setError('Failed to load course details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserContext = async () => {
    try {
      const response = await authService.getCurrentUser();
      updateUser(response.data.data);
    } catch (err) {
      console.error('Failed to update user context:', err);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPurchasing(true);

    try {
      const response = await transactionService.purchaseCourse({
        courseId: id,
        bankAccountSecret: bankSecret,
      });

      if (response.data.data.user) {
        updateUser(response.data.data.user);
      }

      setSuccess('Course purchased successfully! Redirecting...');
      setTimeout(() => {
        navigate('/my-courses');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      await certificateService.generateCertificate(id);
      alert('Certificate generated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate certificate');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading course...</div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-xl text-gray-600">Course not found</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const enrolledCourse = user?.enrolledCourses?.find(c => {
    const enrolledId = c.courseId || c.course;
    return enrolledId && (enrolledId.toString() === id || enrolledId._id?.toString() === id);
  });
  const progress = enrolledCourse?.progress || 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-64 flex items-center justify-center relative bg-gray-900">
              <img
                src={course.thumbnail || '/courses/default-course-thumbnail.jpg'}
                alt={course.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/1200x600?text=Course+Detail';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <h1 className="text-4xl font-bold text-white text-center px-4 relative z-10 drop-shadow-lg">{course.title}</h1>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Course</h2>
                    <p className="text-gray-600 leading-relaxed">{course.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-100 p-4 rounded">
                      <p className="text-sm text-gray-600">Instructor</p>
                      <p className="font-semibold">{course.instructorName}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded">
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{course.duration} hours</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded">
                      <p className="text-sm text-gray-600">Level</p>
                      <p className="font-semibold">{course.level}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded">
                      <p className="text-sm text-gray-600">Students</p>
                      <p className="font-semibold">{course.enrolledStudents?.length || 0}</p>
                    </div>
                  </div>

                  {/* Course Materials Section */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Materials</h2>

                    {/* Instructor Upload Section */}
                    {user && course.instructor && ((user._id || user.id) === (course.instructor._id || course.instructor)) && (
                      <MaterialUpload
                        courseId={course._id}
                        onUploadSuccess={fetchCourseDetail}
                      />
                    )}

                    {/* Materials List */}
                    {(isEnrolled || (user && course.instructor && ((user._id || user.id) === (course.instructor._id || course.instructor)))) ? (
                      <MaterialsList
                        courseId={course._id}
                        materials={course.materials || []}
                        isInstructor={user && course.instructor && ((user._id || user.id) === (course.instructor._id || course.instructor))}
                        onRefresh={() => {
                          fetchCourseDetail();
                          updateUserContext(); // Refresh user context to show updated progress bar
                        }}
                        completedMaterials={enrolledCourse?.completedMaterials || []}
                      />
                    ) : (
                      <div className="bg-gray-100 p-6 rounded text-center">
                        <p className="text-gray-600">Enroll in this course to access materials, videos, and resources.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-gray-100 p-6 rounded-lg sticky top-4">
                    <p className="text-3xl font-bold text-primary mb-4">₹{course.price}</p>

                    {user?.role === 'learner' && !isEnrolled && (
                      <form onSubmit={handlePurchase} className="space-y-4">
                        <input
                          type="password"
                          placeholder="Bank Account Secret"
                          value={bankSecret}
                          onChange={(e) => setBankSecret(e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                        />

                        {error && (
                          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                            {error}
                          </div>
                        )}

                        {success && (
                          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm">
                            {success}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={purchasing}
                          className="w-full bg-primary hover:bg-secondary text-white py-3 rounded transition font-medium disabled:opacity-50"
                        >
                          {purchasing ? 'Processing...' : 'Purchase Course'}
                        </button>
                      </form>
                    )}

                    {isEnrolled && (
                      <div className="space-y-4">
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                          You are enrolled in this course
                        </div>

                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Your Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-3">
                            <div
                              className="bg-green-500 h-3 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <h1 className='text-red-500 font-bold'>Caution!!</h1>
                          <p>This current version of that website can't generate the certificate yet</p>
                        </div>
                        {progress === 100 && (
                          <button
                            onClick={handleGenerateCertificate}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded transition font-medium"
                          >
                            Generate Certificate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetail;
