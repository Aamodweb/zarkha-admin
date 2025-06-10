const multer = require('multer');
const path = require('path'); 

const setupStorage = (uploadPath) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            const absolutePath = path.join(__dirname, uploadPath); // Full path for storing the file
            console.log("absolutepath",absolutePath);
            cb(null, absolutePath);
        },
        filename: function (req, file, cb) {
            const uniqueFileName = Date.now() + '-' + file.originalname;

            // Update the `path` property to store the relative path
            file.path = path.join(uploadPath, uniqueFileName).replace(/\\/g, '/'); 
            console.log("file path",file.path);
            cb(null, uniqueFileName);
        }
    });
};

// Middleware to use multer
const multerConfig = (uploadPath) => {
    const storage = setupStorage(uploadPath);
    return multer({ storage });
};

module.exports = { setupStorage,multerConfig };