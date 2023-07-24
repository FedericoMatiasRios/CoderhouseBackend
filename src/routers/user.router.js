import express from 'express';
import { controladorSwitchRole, controladorUploadDocuments, controladorUsersGet, deleteInactiveUsers, uploadMiddleware } from '../controllers/user.controller.js';
import { isAdmin } from './product.router.js';

export const userRouter = express.Router();

userRouter.get('/', controladorUsersGet);
userRouter.delete('/', isAdmin, deleteInactiveUsers);
userRouter.put('/premium/:uid', controladorSwitchRole);
userRouter.post('/:uid/documents', uploadMiddleware, controladorUploadDocuments);