import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { postLoad, getLoads } from '../controllers/loadController.js';

const router = express.Router();

// Setup multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/loads/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.any(), postLoad);
router.get('/', getLoads);

export default router;
