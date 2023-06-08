import express from 'express';
import passport from 'passport';
import flash from 'connect-flash';
import { webRouter } from '../controllers/base.controller.js';
import { setDefaultUserId } from "../controllers/utilities.controller.js";
import { serializeUserController, deserializeUserController, githubStrategy, githubAuth, githubAuthCallback, githubAuthCallbackHandler, sessionMiddleware, renderLoginPage, handleLogin, showRegisterPage, registerUser, localStrategy, forgotGet, forgotPost, resetGet, resetPost } from "../controllers/session.controller.js";

export const authRouter = express.Router();

// session middleware
authRouter.use(sessionMiddleware);
authRouter.use(flash());

// passport middleware
authRouter.use(passport.initialize());
authRouter.use(passport.session());
passport.use(localStrategy);
passport.use(githubStrategy);
passport.serializeUser(serializeUserController);
passport.deserializeUser(deserializeUserController);

// github login routes
authRouter.get('/login/github', githubAuth());
authRouter.get('/login/github/callback', githubAuthCallback, githubAuthCallbackHandler);

// session login routes
authRouter.get('/login', renderLoginPage);
authRouter.post('/login', handleLogin);

// session register routes
authRouter.get('/register', showRegisterPage);
authRouter.post('/register', registerUser);

// password recovery
authRouter.get('/forgot-password', forgotGet);
authRouter.post('/forgot-password', forgotPost);
authRouter.get('/reset-password/:token', resetGet);
authRouter.post('/reset-password/:token', resetPost);

// session logout routes
authRouter.get('/logout', webRouter);

// default user ID middleware
authRouter.use(setDefaultUserId);