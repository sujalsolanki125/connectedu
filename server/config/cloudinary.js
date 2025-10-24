const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
// Ensure .env is loaded even if import order changes
dotenv.config();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
let { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, NODE_ENV } = process.env;

// Normalize: trim any accidental spaces/newlines
CLOUDINARY_CLOUD_NAME = (CLOUDINARY_CLOUD_NAME || '').trim();
CLOUDINARY_API_KEY = (CLOUDINARY_API_KEY || '').trim();
CLOUDINARY_API_SECRET = (CLOUDINARY_API_SECRET || '').trim();

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Cloudinary env missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Helpful debug in development (no secrets exposed)
if ((NODE_ENV || 'development') === 'development') {
  const keyStr = String(CLOUDINARY_API_KEY || '');
  console.log(
    `Cloudinary configured -> cloud: ${CLOUDINARY_CLOUD_NAME || '(missing)'} | api_key: ${keyStr ? keyStr.slice(0, 4) + '...' + keyStr.slice(-4) : '(missing)'} `
  );
}

// Storage configuration for profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'alumni-connect/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'limit' }, // Max dimensions
      { quality: 'auto' }, // Auto-optimize quality
    ],
  },
});

// Storage configuration for resumes (PDFs)
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'alumni-connect/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw', // Important for non-image files
  },
});

// Storage configuration for resource files (PDFs, DOC, Excel, etc.)
const resourceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'alumni-connect/resources',
    allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    resource_type: 'raw',
    // Use original filename (preserve extension)
    use_filename: true,
    unique_filename: true, // Add unique suffix to avoid conflicts
  },
});

// Multer upload instances
const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit for profile images
  },
  fileFilter: (req, file, cb) => {
    // Check file type - only PNG and JPG
    const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPG images are allowed! File size must be ≤3MB'), false);
    }
  },
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for resumes
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes!'), false);
    }
  },
});

const uploadResource = multer({
  storage: resourceStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for resources
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed! Please upload PDF, DOC, DOCX, XLS, or XLSX files only.'), false);
    }
  },
});

module.exports = {
  cloudinary,
  uploadProfileImage,
  uploadResume,
  uploadResource,
};
