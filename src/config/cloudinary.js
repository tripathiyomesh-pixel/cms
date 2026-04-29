const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/quicktime',
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = `${process.env.CLOUDINARY_FOLDER || 'jewellery-cms'}/${req.params.id || 'general'}`;
    const isVideo = file.mimetype.startsWith('video');
    return {
      folder,
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
      transformation: isVideo
        ? [{ quality: 'auto' }]
        : [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 2000, crop: 'limit' },
          ],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  },
});

module.exports = { cloudinary, upload };
