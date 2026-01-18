const Certificate = require('../models/Certificate.model');
const User = require('../models/User.model');
const Course = require('../models/Course.model');

// @desc    Generate certificate upon course completion
// @route   POST /api/certificates/generate
// @access  Private/Learner
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // Check if user is enrolled in the course
    const user = await User.findById(req.user._id);
    const enrollment = user.enrolledCourses.find(
      e => e.courseId.toString() === courseId
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check if course is completed
    if (!enrollment.completed || enrollment.progress < 100) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the course first',
        progress: enrollment.progress
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      learner: req.user._id,
      course: courseId
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already generated for this course',
        data: existingCertificate
      });
    }

    // Get course details
    const course = await Course.findById(courseId).populate('instructor', 'name');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Generate certificate
    const certificate = await Certificate.create({
      learner: req.user._id,
      learnerName: req.user.name,
      course: course._id,
      courseTitle: course.title,
      instructor: course.instructor._id,
      instructorName: course.instructor.name,
      completionDate: enrollment.completedAt || new Date(),
      verificationUrl: `${req.protocol}://${req.get('host')}/api/certificates/verify/${Date.now()}`
    });

    // Add certificate to user
    user.certificates.push(certificate._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: certificate
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: error.message
    });
  }
};

// @desc    Get all certificates for a user
// @route   GET /api/certificates
// @access  Private
exports.getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ learner: req.user._id })
      .populate('course', 'title description')
      .populate('instructor', 'name email')
      .sort('-issueDate');

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates',
      error: error.message
    });
  }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Private
exports.getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('course', 'title description duration')
      .populate('instructor', 'name email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check authorization
    if (certificate.learner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this certificate'
      });
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate',
      error: error.message
    });
  }
};

// @desc    Verify certificate (public)
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
exports.verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId
    })
      .populate('course', 'title')
      .populate('instructor', 'name');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate is valid',
      data: {
        certificateId: certificate.certificateId,
        learnerName: certificate.learnerName,
        courseTitle: certificate.courseTitle,
        instructorName: certificate.instructorName,
        issueDate: certificate.issueDate,
        completionDate: certificate.completionDate,
        isValid: certificate.isValid
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate',
      error: error.message
    });
  }
};

// @desc    Download certificate (formatted)
// @route   GET /api/certificates/:id/download
// @access  Private
exports.downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('course', 'title description duration')
      .populate('instructor', 'name');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check authorization
    if (certificate.learner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this certificate'
      });
    }

    // Create certificate text (in real app, you'd generate a PDF)
    const certificateText = `
╔═══════════════════════════════════════════════════════════════╗
║                    CERTIFICATE OF COMPLETION                  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  This is to certify that                                      ║
║                                                               ║
║              ${certificate.learnerName.toUpperCase()}                     ║
║                                                               ║
║  has successfully completed the course                        ║
║                                                               ║
║              "${certificate.courseTitle}"                     ║
║                                                               ║
║  Instructor: ${certificate.instructorName}                    ║
║  Completion Date: ${certificate.completionDate.toLocaleDateString()}     ║
║  Certificate ID: ${certificate.certificateId}                 ║
║  Grade: ${certificate.grade}                                  ║
║                                                               ║
║  Verification URL: ${certificate.verificationUrl}             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `;

    res.status(200).json({
      success: true,
      data: {
        certificate: certificateText,
        certificateData: certificate
      }
    });
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading certificate',
      error: error.message
    });
  }
};
