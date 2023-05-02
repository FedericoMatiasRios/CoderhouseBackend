//utilities

export const setDefaultUserId = (req, res, next) => {
    if (!req.session) {
        req.session = {};
    }

    if (!req.session.userId) {
        req.session.userId = null;
    }

    next();
};

export const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated() && req.path !== '/login' && req.path !== '/register') {
        return res.redirect('/login');
    }
    return next();
};
