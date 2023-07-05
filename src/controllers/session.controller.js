import { userModel } from '../dao/mongo/models/user.model.js';
import { Strategy as GithubStrategy } from 'passport-github2';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { githubClientId, githubClientSecret, mongodbCnxStr, sessionSecret } from '../config/config.js';
import { webRouter } from './base.controller.js';
import crypto from 'crypto';
import { sendPasswordRecoveryEmail } from './pw-recovery.controller.js';

//session

export const sessionMiddleware = session({
    store: MongoStore.create({
        mongoUrl: mongodbCnxStr
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
});
//login

export function renderLoginPage(req, res) {
    if (req.user) {
        res.redirect('/');
    } else if (req.originalUrl.includes('/forgot-password')) {
        // Handle rendering of forgot password form
        res.render('forgot-password');
    } else if (req.originalUrl.includes('/reset-password')) {
        // Handle rendering of reset password form
        res.render('reset-password', { token: req.params.token });
    } else if (req.originalUrl.includes('/api')) {
        res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
        return res.status(401).send('Authentication required');
    } else {
        res.render('login', { messages: req.flash(), githubAuthUrl: '/login/github' });
    }
}

export function handleLogin(req, res) {
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, async () => {
        if (req.user) {
            req.flash('success', 'Authentication succeeded');

            // Update the last_connection field for the logged-in user
            req.user.last_connection = new Date();
            await req.user.save();

            res.redirect('/');
        } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/login');
        }
    });
}

//register

export function showRegisterPage(req, res) {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('register', { messages: req.flash() });
    }
}
export async function registerUser(req, res) {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            req.flash('error', 'Este email ya ha sido registrado');
            return res.redirect('/register');
        }

        const user = new userModel({ first_name, last_name, email, age, password });
        await user.save();

        req.flash('success', 'Registro exitoso');
        res.redirect('/');
    } catch (error) {
        req.logger.error(error);
        req.flash('error', 'Hubo un error al registrarse');
        console.log(error);
        res.redirect('/register');
    }
}

webRouter.get('/logout', async (req, res) => {
    try {
        // Update the last_connection field for the logged-out user
        req.user.last_connection = new Date();
        await req.user.save();

        req.logout(() => {
            req.session.destroy(err => {
                if (err) {
                    res.render('login', { error: err });
                } else {
                    res.redirect('/login');
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'An error occurred during logout' });
    }
});

//passport

export const localStrategy = new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, async (req, email, password, done) => {
    req.logger.info('LocalStrategy called');

    try {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        req.logger.info('password: ' + password);
        req.logger.info(user.password);
        req.logger.info('Before bcrypt compare');
        const isMatch = await bcrypt.compare(password, user.password);
        req.logger.info('After bcrypt compare');
        if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        req.flash('success', 'Logged in successfully!');
        return done(null, user);
    } catch (err) {
        req.logger.error(err);
        return done(err);
    }
});

export const serializeUserController = (user, done) => {
    done(null, user._id);
};

export const deserializeUserController = async (req, id, done) => {
    req.logger.info('deserializeUser called with id:', id);
    try {
        const user = await userModel.findById(id);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (err) {
        req.logger.error(err);
        return done(err);
    }
};
//passport github login
function mapGithubUserToLocalUser(githubUser) {
    const email = githubUser._json.email != null ? githubUser._json.email : `${githubUser.username}@github.com`;
    const firstName = githubUser.displayName != null ? githubUser.displayName : 'Unknown';
    const lastName = githubUser.id != null ? githubUser.id : 'Unknown';
    const age = 0;
    const password = 'generateRandomLater';

    return {
        email,
        first_name: firstName,
        last_name: lastName,
        age,
        password,
    };
}

export const githubStrategy = new GithubStrategy({
    clientID: githubClientId,
    clientSecret: githubClientSecret,
    callbackURL: "http://localhost:8080/login/github/callback"
},
    async function (accessToken, refreshToken, githubUser, done) {
        // asynchronous verification, for effect...
        process.nextTick(async function () {

            // Map the Github user to your local user schema
            const user = mapGithubUserToLocalUser(githubUser);

            try {
                // Check if the user already exists in the database
                const email = githubUser._json.email != null ? githubUser._json.email : `${githubUser.username}@github.com`;
                const existingUser = await userModel.findOne({ email: email });

                if (existingUser) {
                    // Update the last_connection field
                    existingUser.last_connection = new Date();

                    // Update the existing user with the latest Github info
                    const updatedUser = await userModel.findOneAndUpdate(
                        { email: email },
                        user,
                        { new: true }
                    );
                    return done(null, updatedUser);
                } else {
                    // Set the last_connection field for the new user
                    user.last_connection = new Date();

                    // Save the user to the database and return it
                    const createdUser = await userModel.create(user);
                    return done(null, createdUser);
                }
            } catch (err) {
                return done(err);
            }
        });
    }
);

export const githubAuth = () => passport.authenticate('github', { scope: ['user:email'] });

export const githubAuthCallback = passport.authenticate('github', { failureRedirect: '/login' });

export const githubAuthCallbackHandler = (req, res) => {
    res.redirect('/');
};

// password recovery

export async function forgotGet(req, res) {
    res.render('forgot-password', { messages: req.flash() });
}

export async function forgotPost(req, res) {

    const { email } = req.body;

    try {
        // Find the user based on the provided email
        const user = await userModel.findOne({ email });

        if (!user) {
            req.flash('error', 'No user found with that email');
            return res.redirect('/forgot-password');
        }

        // Generate a password recovery token
        const token = crypto.randomBytes(32).toString('hex');

        // Set the password recovery token and expiration in the user document
        user.passwordRecoveryToken = token;
        user.passwordRecoveryTokenExpiration = Date.now() + 3600000;
        await user.save();

        // Compose the email subject and body
        const emailSubject = 'Password Recovery';
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
        const emailBody = `Click the following link to reset your password: ${resetLink}`;

        // Send the password recovery email
        await sendPasswordRecoveryEmail(email, emailSubject, emailBody);
        console.log('after recovery send');
        req.flash('success', 'Password recovery email sent');
        res.redirect('/forgot-password');

    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while processing your request');
        res.redirect('/forgot-password');
    }
}

export async function resetGet(req, res) {

    const { token } = req.params;

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

        // Render the password reset form with the token
        res.render('reset-password', { token, messages: req.flash() });

    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while processing your request');
        res.redirect('/forgot-password');
    }
}

export async function resetPost(req, res) {

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

        // Check if the new password is the same as the current one
        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) {
            req.flash('error', 'New password must be different from the current one');
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
}