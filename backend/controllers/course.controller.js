const Course = require('../models/Course.model');
const User = require('../models/User.model');
const BankService = require('../services/bankService');
const fs = require('fs'); // Keep for fallback if needed, though mostly unused now
const path = require('path');
const { cloudinary } = require('../config/cloudinary.config');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .populate('instructor', 'name email')
      .select('-materials')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If user is enrolled, show materials, otherwise hide them
    let courseData = course.toObject();

    if (req.user) {
      const isEnrolled = req.user.enrolledCourses.some(
        enrollment => enrollment.courseId.toString() === course._id.toString()
      );

      // Show materials to enrolled users, instructors (owners), and admins
      if (!isEnrolled && req.user.role !== 'instructor' && req.user.role !== 'admin') {
        delete courseData.materials;
      }
    } else {
      delete courseData.materials;
    }

    res.status(200).json({
      success: true,
      data: courseData
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// @desc    Create new course (Instructor only)
// @route   POST /api/courses
// @access  Private/Instructor
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, duration, category, level, materials } = req.body;

    // Check if instructor has bank account
    if (!req.user.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please set up your bank account first'
      });
    }

    // Count instructor's courses
    const courseCount = await Course.countDocuments({ instructor: req.user._id });

    // Limit to 5 courses as per requirement (allowing each instructor to create multiple)
    // But total system courses should be 5
    const totalCourses = await Course.countDocuments({ isActive: true });

    if (totalCourses >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum number of courses (5) reached in the system'
      });
    }

    // Create course
    const course = await Course.create({
      title,
      description,
      price,
      duration,
      category,
      level,
      materials: materials || [],
      instructor: req.user._id,
      instructorName: req.user.name
    });

    // Add course to instructor's created courses
    req.user.createdCourses.push(course._id);
    await req.user.save();

    // Reward instructor for uploading course via Bank Service
    const reward = parseFloat(process.env.COURSE_UPLOAD_REWARD) || 5000;

    const rewardTransfer = await BankService.transfer({
      from: process.env.LMS_BANK_ACCOUNT,
      to: req.user.bankAccount.accountNumber,
      amount: reward,
      secret: process.env.BANK_SECRET_KEY,
      description: `Course upload reward for ${title}`
    });

    if (rewardTransfer.success) {
      // Update local balance cache
      req.user.bankAccount.balance = rewardTransfer.data.to.newBalance;
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// @desc    Update course (Instructor only - own courses)
// @route   PUT /api/courses/:id
// @access  Private/Instructor
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this course'
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// @desc    Delete course (Instructor only - own courses)
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this course'
      });
    }

    // Soft delete - just set isActive to false
    course.isActive = false;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// @desc    Add material to course
// @route   POST /api/courses/:id/materials
// @access  Private/Instructor
exports.addMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add materials to this course'
      });
    }

    const { title, type, content, duration, order } = req.body;

    course.materials.push({
      title,
      type,
      content,
      duration: duration || 0,
      order: order || course.materials.length
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Material added successfully',
      data: course
    });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding material',
      error: error.message
    });
  }
};

// @desc    Upload course material (file)
// @route   POST /api/courses/:id/materials/upload
// @access  Private/Instructor
exports.uploadMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add materials to this course'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { title, type, description, order, duration } = req.body;

    // Determine folder and resource type
    let folder = 'lms_course_materials';
    let resource_type = 'auto';

    if (req.file.mimetype.startsWith('video/')) {
      folder = 'lms_course_videos';
      resource_type = 'video';
    } else if (req.file.mimetype.startsWith('image/')) {
      folder = 'lms_course_images';
      resource_type = 'image';
    } else {
      folder = 'lms_course_docs';
      resource_type = 'raw';
    }

    // Upload to Cloudinary using upload_stream
    const uploadPromise = new Promise((resolve, reject) => {
      const options = {
        folder: folder,
        resource_type: resource_type,
        public_id: req.file.originalname.split('.')[0] + '-' + Date.now()
      };

      let uploadStreamFn;
      const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
      if (preset) {
        // Prefer unsigned upload when preset is available to avoid timestamp/signature issues
        uploadStreamFn = cloudinary.uploader.unsigned_upload_stream.bind(cloudinary.uploader, preset, options);
      } else {
        uploadStreamFn = cloudinary.uploader.upload_stream.bind(cloudinary.uploader, options);
      }

      const uploadStream = uploadStreamFn((error, result) => {
        if (error) return reject(error);
        return resolve(result);
      });

      uploadStream.end(req.file.buffer);
    });

    const uploadResult = await uploadPromise;

    const sizeInBytes = req.file.size || 0;
    const fileSize = (sizeInBytes / 1024 / 1024).toFixed(2) + ' MB';

    course.materials.push({
      title: title || req.file.originalname,
      type: type || 'document',
      content: description || 'File content',
      fileUrl: uploadResult.secure_url,
      fileName: uploadResult.public_id,
      fileSize: fileSize,
      duration: duration || 0,
      order: order || course.materials.length
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      data: course
    });
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(error.http_code || 500).json({
      success: false,
      message: error.message || 'Error uploading material'
    });
  }
};

// @desc    Remove material from course
// @route   DELETE /api/courses/:id/materials/:materialId
// @access  Private/Instructor
exports.removeMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to remove materials from this course'
      });
    }

    const material = course.materials.id(req.params.materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Delete file from Cloudinary 
    if (material.fileUrl && material.fileName) {
      try {
        // Determine resource type based on material type roughly, or just try destroy
        // material.fileName serves as public_id in our logic above
        const options = {};
        if (material.type === 'video') options.resource_type = 'video';
        else if (material.type === 'image') options.resource_type = 'image';
        else options.resource_type = 'raw'; // Default for docs

        await cloudinary.uploader.destroy(material.fileName, options);
      } catch (cloudinaryError) {
        console.error('Do not block DB delete if Cloudinary fail, but log it:', cloudinaryError);
      }
    }

    // Deprecated: material.remove() is no longer available in Mongoose v7+
    // Use pull instead
    course.materials.pull(req.params.materialId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Material removed successfully',
      data: course
    });
  } catch (error) {
    console.error('Remove material error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing material',
      error: error.message
    });
  }
};

// @desc    Get material file (secure access)
// @route   GET /api/courses/:id/materials/:materialId/file
// @access  Private/Enrolled or Instructor
exports.getMaterialFile = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id); // Optimized query handled later if needed

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const material = course.materials.id(req.params.materialId);

    if (!material || !material.fileUrl) {
      return res.status(404).json({
        success: false,
        message: 'Material file not found'
      });
    }

    // Access control
    let hasAccess = false;

    // 1. Instructor
    if (req.user && course.instructor.toString() === req.user._id.toString()) {
      hasAccess = true;
    }

    // 2. Enrolled Student
    if (!hasAccess && req.user) {
      // Check user enrollments
      const isEnrolled = req.user.enrolledCourses.some(
        enrollment => enrollment.courseId.toString() === course._id.toString()
      );
      if (isEnrolled) hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be enrolled in this course.'
      });
    }

    // Redirect to the Cloudinary URL
    // This hides the actual URL structure slightly or allows us to inject checks before access
    res.redirect(material.fileUrl);

  } catch (error) {
    console.error('Get material file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving file',
      error: error.message
    });
  }
};

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private/Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get enrolled courses for learner
// @route   GET /api/courses/learner/enrolled
// @access  Private/Learner
exports.getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses.courseId',
        populate: {
          path: 'instructor',
          select: 'name email'
        }
      });

    res.status(200).json({
      success: true,
      count: user.enrolledCourses.length,
      data: user.enrolledCourses
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses',
      error: error.message
    });
  }
};

// @desc    Update course progress
// @route   PUT /api/courses/:id/progress
// @access  Private/Learner
exports.updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }

    const user = await User.findById(req.user._id);
    const enrollment = user.enrolledCourses.find(
      e => e.courseId.toString() === req.params.id
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    enrollment.progress = progress;

    if (progress === 100 && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

// @desc    Mark material as completed
// @route   POST /api/courses/:id/materials/:materialId/complete
// @access  Private/Learner
exports.markMaterialCompleted = async (req, res) => {
  try {
    const { id, materialId } = req.params;

    const user = await User.findById(req.user._id);
    const enrollment = user.enrolledCourses.find(
      e => e.courseId.toString() === id
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Initialize completedMaterials if it doesn't exist
    if (!enrollment.completedMaterials) {
      enrollment.completedMaterials = [];
    }

    // Add material if not already completed
    if (!enrollment.completedMaterials.includes(materialId)) {
      enrollment.completedMaterials.push(materialId);
    }

    // Calculate progress based on materials AND quizzes
    const course = await Course.findById(id);
    const totalMaterials = course.materials.length;
    const totalRequiredQuizzes = course.quizzes ? course.quizzes.filter(q => q.isRequired).length : 0;
    const totalItems = totalMaterials + totalRequiredQuizzes;

    const completedMaterialsCount = enrollment.completedMaterials.length;
    
    // Count passed required quizzes
    let passedRequiredQuizzes = 0;
    if (course.quizzes && enrollment.quizAttempts) {
      passedRequiredQuizzes = course.quizzes.filter(q => {
        if (!q.isRequired) return false;
        const attempts = enrollment.quizAttempts.filter(a => a.quizId === q._id.toString());
        return attempts.some(a => a.passed);
      }).length;
    }

    let progress = 0;
    if (totalItems > 0) {
      progress = Math.round(((completedMaterialsCount + passedRequiredQuizzes) / totalItems) * 100);
    }

    // Ensure progress doesn't exceed 100
    progress = Math.min(progress, 100);

    enrollment.progress = progress;

    if (progress === 100 && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Material marked as completed',
      data: {
        progress,
        completed: enrollment.completed,
        completedMaterials: enrollment.completedMaterials
      }
    });
  } catch (error) {
    console.error('Mark material completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking material as completed',
      error: error.message
    });
  }
};

// @desc    Add quiz to course
// @route   POST /api/courses/:id/quizzes
// @access  Private/Instructor
exports.addQuiz = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add quizzes to this course'
      });
    }

    const { title, description, questions, passingScore, timeLimit, isRequired } = req.body;

    // Validate questions
    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz must have at least one question'
      });
    }

    // Validate each question has 4 options and a valid correct answer
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || q.options.length !== 4) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have exactly 4 options`
        });
      }
      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} has invalid correct answer index`
        });
      }
    }

    course.quizzes.push({
      title,
      description: description || '',
      questions,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 0,
      order: course.quizzes.length,
      isRequired: isRequired !== false
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Quiz added successfully',
      data: course.quizzes[course.quizzes.length - 1]
    });
  } catch (error) {
    console.error('Add quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding quiz',
      error: error.message
    });
  }
};

// @desc    Get course quizzes (for enrolled users)
// @route   GET /api/courses/:id/quizzes
// @access  Private/Learner
exports.getQuizzes = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled or instructor
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isEnrolled = req.user.enrolledCourses.some(
      e => e.courseId.toString() === req.params.id
    );

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to view quizzes'
      });
    }

    // For learners, hide correct answers
    let quizzes = course.quizzes.map(quiz => {
      const quizObj = quiz.toObject();
      if (!isInstructor) {
        quizObj.questions = quizObj.questions.map(q => ({
          question: q.question,
          options: q.options,
          _id: q._id
          // correctAnswer and explanation hidden
        }));
      }
      return quizObj;
    });

    // Get user's quiz attempts
    const enrollment = req.user.enrolledCourses.find(
      e => e.courseId.toString() === req.params.id
    );

    res.status(200).json({
      success: true,
      data: {
        quizzes,
        attempts: enrollment?.quizAttempts || []
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
      error: error.message
    });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/courses/:id/quizzes/:quizId/submit
// @access  Private/Learner
exports.submitQuiz = async (req, res) => {
  try {
    const { id, quizId } = req.params;
    const { answers } = req.body; // Array of { questionIndex, selectedAnswer }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const user = await User.findById(req.user._id);
    const enrollment = user.enrolledCourses.find(
      e => e.courseId.toString() === id
    );

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    const quiz = course.quizzes.id(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!answers || answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Please answer all questions'
      });
    }

    // Grade the quiz
    let correctCount = 0;
    const gradedAnswers = answers.map((ans, idx) => {
      const question = quiz.questions[idx];
      const isCorrect = ans.selectedAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: idx,
        selectedAnswer: ans.selectedAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Initialize quizAttempts if needed
    if (!enrollment.quizAttempts) {
      enrollment.quizAttempts = [];
    }

    // Record the attempt
    enrollment.quizAttempts.push({
      quizId: quizId,
      score,
      passed,
      answers: gradedAnswers,
      attemptedAt: new Date()
    });

    // Recalculate progress based on materials AND quizzes
    const totalMaterials = course.materials.length;
    const totalRequiredQuizzes = course.quizzes.filter(q => q.isRequired).length;
    const totalItems = totalMaterials + totalRequiredQuizzes;

    const completedMaterials = enrollment.completedMaterials?.length || 0;
    
    // Count passed required quizzes
    const passedRequiredQuizzes = course.quizzes.filter(q => {
      if (!q.isRequired) return false;
      const attempts = enrollment.quizAttempts.filter(a => a.quizId === q._id.toString());
      return attempts.some(a => a.passed);
    }).length;

    let progress = 0;
    if (totalItems > 0) {
      progress = Math.round(((completedMaterials + passedRequiredQuizzes) / totalItems) * 100);
    }
    progress = Math.min(progress, 100);

    enrollment.progress = progress;

    if (progress === 100 && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: passed ? 'Congratulations! You passed the quiz!' : 'Quiz submitted. Keep trying!',
      data: {
        score,
        passed,
        passingScore: quiz.passingScore,
        correctCount,
        totalQuestions: quiz.questions.length,
        answers: gradedAnswers.map((a, idx) => ({
          ...a,
          correctAnswer: quiz.questions[idx].correctAnswer,
          explanation: quiz.questions[idx].explanation
        })),
        progress: enrollment.progress,
        courseCompleted: enrollment.completed
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message
    });
  }
};

// @desc    Delete quiz from course
// @route   DELETE /api/courses/:id/quizzes/:quizId
// @access  Private/Instructor
exports.deleteQuiz = async (req, res) => {
  try {
    const { id, quizId } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete quizzes from this course'
      });
    }

    const quiz = course.quizzes.id(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    course.quizzes.pull(quizId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz',
      error: error.message
    });
  }
};
