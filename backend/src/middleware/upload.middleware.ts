import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// Ensure the uploads directory exists
// __dirname is the directory of the current module
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
} 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Multer destination - file received:', file.fieldname, file.originalname);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        const extension = path.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
        console.log('Multer filename assigned:', filename);
        cb(null, filename);
    }
});
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log('Multer fileFilter - checking file:', file.fieldname, file.mimetype);
    if (!file.mimetype.startsWith('image/')) {
        console.log('Multer fileFilter - rejecting non-image:', file.mimetype);
        return cb(new Error('Only image files are allowed!'));
    }
    console.log('Multer fileFilter - accepting file');
    cb(null, true);
};
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
});

export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray)
};