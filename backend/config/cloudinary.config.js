const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
console.log('Cloudinary Config Loading. Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Present' : 'MISSING');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Use memory storage - we'll upload to Cloudinary manually
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

module.exports = { upload, cloudinary };
