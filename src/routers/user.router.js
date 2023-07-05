import express from 'express';
import { controladorSwitchRole, controladorUploadDocuments, controladorUsersGet, uploadMiddleware } from '../controllers/user.controller.js';
import { isAdmin } from './product.router.js';

export const userRouter = express.Router();

userRouter.get('/', isAdmin, controladorUsersGet);
userRouter.put('/premium/:uid', controladorSwitchRole);
userRouter.post('/:uid/documents', uploadMiddleware, controladorUploadDocuments);