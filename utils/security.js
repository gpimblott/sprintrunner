/**
 * Security helper functions
 */
var Security = function () {
};

/**
 *  route middleware to make sure a user is logged in
 */
Security.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
};


module.exports=Security;