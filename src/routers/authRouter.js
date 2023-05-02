import express from 'express';
import passport from 'passport';
import flash from 'connect-flash';
import { webRouter } from '../controllers/baseControllers.js';
import { setDefaultUserId } from "../controllers/utilitiesController.js";
import { serializeUserController, deserializeUserController, githubStrategy, githubAuth, githubAuthCallback, githubAuthCallbackHandler, sessionMiddleware, renderLoginPage, handleLogin, showRegisterPage, registerUser, localStrategy } from "../controllers/sessionController.js";

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

// session logout routes
authRouter.get('/logout', webRouter);

// default user ID middleware
authRouter.use(setDefaultUserId);