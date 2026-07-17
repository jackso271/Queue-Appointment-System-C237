function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  return res.redirect('/auth/login?error=' + encodeURIComponent('Please login to continue.'));
}

function ensureCustomer(req, res, next) {
  if (req.session && req.session.role === 'Customer') {
    return next();
  }

  return res.status(403).send('Customer access only.');
}

function ensureAdmin(req, res, next) {
  if (req.session && req.session.role === 'Admin') {
    return next();
  }

  return res.status(403).send('Administrator access only.');
}

function ensureAccountActive(req, res, next) {
  if (req.session && req.session.accountStatus === 'Active') {
    return next();
  }

  return res.status(403).send('Your account is not active.');
}

module.exports = {
  ensureAuthenticated,
  ensureCustomer,
  ensureAdmin,
  ensureAccountActive
};
