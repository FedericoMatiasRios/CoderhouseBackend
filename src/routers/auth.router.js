import express from 'express';
import passport from 'passport';
import flash from 'connect-flash';
import { webRouter } from '../controllers/base.controller.js';
import { setDefaultUserId } from "../controllers/utilities.controller.js";
import { serializeUserController, deserializeUserController, githubStrategy, githubAuth, githubAuthCallback, githubAuthCallbackHandler, sessionMiddleware, renderLoginPage, handleLogin, showRegisterPage, registerUser, localStrategy } from "../controllers/session.controller.js";
import { sendPasswordRecoveryEmail } from '../controllers/passwordRecover.js';
import { userModel } from '../dao/mongo/models/user.model.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

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

// GET route for displaying the forgot password form
authRouter.get('/forgot-password', (req, res) => {
    res.render('forgot-password', {messages: req.flash()});
 });
 
 // POST route for handling the forgot password form submission
 authRouter.post('/forgot-password', async (req, res) => {

    const { email } = req.body;

    try {
      // Find the user based on the provided email
      const user = await userModel.findOne({ email });

      if (!user) {
        req.flash('error', 'No user found with that email');
        return res.redirect('/forgot-password'); // Redirect back to the forgot password form
      }
      console.log('user exists')
      // Generate a password recovery token (e.g., using a library like `crypto-random-string`)
      const token = crypto.randomBytes(32).toString('hex');
      console.log('token generated');
      // Set the password recovery token and expiration in the user document
      user.passwordRecoveryToken = token;
      user.passwordRecoveryTokenExpiration = Date.now() + 3600000; // Token expires after 1 hour (in milliseconds)
      await user.save();
      console.log('before constants definition');
      // Compose the email subject and body
      const emailSubject = 'Password Recovery';
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
      const emailBody = `Click the following link to reset your password: ${resetLink}`;
      console.log('before recovery send');
      // Send the password recovery email
      await sendPasswordRecoveryEmail(email, emailSubject, emailBody);
      console.log('after recovery send');
      req.flash('success', 'Password recovery email sent');
      res.redirect('/forgot-password'); // Redirect back to the forgot password form
    } catch (error) {
        console.log('catched error')
      console.error(error);
      req.flash('error', 'An error occurred while processing your request');
      res.redirect('/forgot-password'); // Redirect back to the forgot password form
    }
  });
  

// GET route for displaying the password reset form
authRouter.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    console.log(token);
 
    try {
       // Find the user based on the password recovery token
       const user = await userModel.findOne({ passwordRecoveryToken: token });
 
       if (!user) {
          req.flash('error', 'Invalid or expired password recovery token');
          return res.redirect('/forgot-password'); // Redirect to the password recovery request page
       }
 
       // Check if the token has expired (assuming you have a token expiration field in the user model)
       const tokenExpiration = user.passwordRecoveryTokenExpiration;
       if (Date.now() > tokenExpiration) {
          req.flash('error', 'Password recovery token has expired');
          return res.redirect('/forgot-password'); // Redirect to the password recovery request page
       }
 
       // Render the password reset form with the token
       res.render('reset-password', { token, messages: req.flash() });
    } catch (error) {
       console.error(error);
       req.flash('error', 'An error occurred while processing your request');
       res.redirect('/forgot-password'); // Redirect to the password recovery request page
    }
 });
 
 // POST route for handling password reset form submission
authRouter.post('/reset-password/:token', async (req, res) => {
   const { token } = req.params;
   const { password, confirmPassword } = req.body;
 
   try {
     // Find the user based on the password recovery token
     const user = await userModel.findOne({ passwordRecoveryToken: token });
 
     if (!user) {
       req.flash('error', 'Invalid or expired password recovery token');
       return res.redirect('/forgot-password');
     }
 
     // Check if the token has expired
     const tokenExpiration = user.passwordRecoveryTokenExpiration;
     if (Date.now() > tokenExpiration) {
       req.flash('error', 'Password recovery token has expired');
       return res.redirect('/forgot-password');
     }
 
     // Check if the password and confirm password match
     if (password !== confirmPassword) {
       req.flash('error', 'Passwords do not match');
       return res.redirect(`/reset-password/${token}`);
     }
 
     // Update the user's password and clear the password recovery token
     user.password = password;
     user.passwordRecoveryToken = undefined;
     user.passwordRecoveryTokenExpiration = undefined;
     await user.save();
 
     req.flash('success', 'Password reset successfully');
     res.redirect('/login');
   } catch (error) {
     console.error(error);
     req.flash('error', 'An error occurred while processing your request');
     res.redirect('/forgot-password');
   }
 });
 

// session logout routes
authRouter.get('/logout', webRouter);

// default user ID middleware
authRouter.use(setDefaultUserId);