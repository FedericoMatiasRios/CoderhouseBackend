//utilities
import bcrypt from 'bcrypt';
import { userModel } from "../dao/mongo/models/user.model.js";
import winston from "winston";
import { winstonLogger } from '../utils/winstonLogger.js';

export const setDefaultUserId = (req, res, next) => {
  if (!req.session) {
    req.session = {};
  }

  if (!req.session.userId) {
    req.session.userId = null;
  }

  next();
};

/* export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated() && req.path !== '/login' && req.path !== '/register' && !req.path.includes('/api')) {
    return res.redirect('/login');
  }
  return next();
}; */

export const loggerTest = (req, res, next) => {
  req.logger.fatal('fatal log ok');
  req.logger.error('error log ok');
  req.logger.warning('warning log ok');
  req.logger.info('info log ok');
  req.logger.http('http log logger');
  req.logger.debug('debug log ok');

  return res.send('Logging completed!');
};

export const requireAuth = async (req, res, next) => {

  if (req.originalUrl.includes('/api')) {

    // Check if the request is an API request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
      return res.status(401).send('Authentication required');
    }

    const [email, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    try {
      const user = await userModel.findOne({ email: email });
      if (!user) {
        res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
        return res.status(401).send('Authentication failed');
      }

      const result = await bcrypt.compare(password, user.password);
      if (result) {
        req.user = user;
        return next();
      } else {
        res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
        return res.status(401).send('Authentication failed');
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send('Internal Server Error');
    }
  } else if (!req.isAuthenticated() && req.path !== '/login' && req.path !== '/register') {

    // Check if the request is a form submission
    if (
      req.method === 'POST' &&
      (req.is('application/x-www-form-urlencoded') || req.is('multipart/form-data'))
    ) {

      // Allow the request to proceed without authentication
      return next();
    }

    // Redirect to the login page for other types of requests
    return res.redirect('/login');
  } else if (!req.isAuthenticated() && req.path !== '/login' && req.path !== '/register') {
    return res.redirect('/login');
  }

  return next();
};
