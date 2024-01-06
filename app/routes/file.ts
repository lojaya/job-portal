import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as fileUploadAction from '../usecases/file.upload';

const router = express.Router();

// upload file media
router.post('/upload', authenticate(), fileUploadAction.handler);

export default router;
