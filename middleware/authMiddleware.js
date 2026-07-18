const userModel = require('../models/userModel');

// ------------------------------------------------------------------
// Authentication middleware.
// Confirms the session has a userId, then re-reads the user from the
// DB (DB interaction 3) so a deleted/edited account can't keep using
// a stale session. Refreshes the session with current values and
// attaches the record to req.currentUser for downstream handlers.
// ------------------------------------------------------------------
async function ensureAuthenticated(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/auth/login?error=' + encodeURIComponent('Please login to continue.'));
  }

  try {
    const user = await userModel.getUserById(req.session.userId);

    if (!user) {
      // Account no longer exists — kill the stale session
      req.session.destroy(() => {});
      return res.redirect('/auth/login?error=' + encodeURIComponent('Your session is no longer valid. Please login again.'));
    }

    // Keep the session in sync with the DB in case profile/role/status changed
    req.session.fullName = user.fullName;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.accountStatus = user.accountStatus;

    req.currentUser = user;
    return next();
  } catch (error) {
    console.error('ensureAuthenticated error:', error);
    return res.status(500).send('Unable to verify session at this time.');
  }
}

// ------------------------------------------------------------------
// Authorization middleware factory.
// Re-reads role + accountStatus straight from the DB (DB interaction 6)
// rather than trusting the session, so a role change or account
// suspension takes effect immediately, not just on next login.
// Must be used AFTER ensureAuthenticated.
// ------------------------------------------------------------------
function ensureRole(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Please login to continue.'));
    }

    try {
      const status = await userModel.getRoleAndStatus(req.session.userId);

      if (!status) {
        req.session.destroy(() => {});
        return res.redirect('/auth/login?error=' + encodeURIComponent('Your session is no longer valid. Please login again.'));
      }

      if (status.accountStatus !== 'Active') {
        return res.status(403).send('Your account is not active.');
      }

      if (!allowedRoles.includes(status.role)) {
        return res.status(403).send('You do not have permission to access this resource.');
      }

      return next();
    } catch (error) {
      console.error('ensureRole error:', error);
      return res.status(500).send('Unable to verify authorization at this time.');
    }
  };
}

// Convenience wrappers built on ensureRole, kept for compatibility
// with existing route code that used ensureCustomer / ensureAdmin.
const ensureCustomer = ensureRole('Customer');
const ensureAdmin = ensureRole('Admin');

// Standalone account-status check, kept for routes that only need this.
async function ensureAccountActive(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/auth/login?error=' + encodeURIComponent('Please login to continue.'));
  }

  try {
    const status = await userModel.getRoleAndStatus(req.session.userId);
    if (status && status.accountStatus === 'Active') {
      return next();
    }
    return res.status(403).send('Your account is not active.');
  } catch (error) {
    console.error('ensureAccountActive error:', error);
    return res.status(500).send('Unable to verify account status at this time.');
  }
}

module.exports = {
  ensureAuthenticated,
  ensureRole,
  ensureCustomer,
  ensureAdmin,
  ensureAccountActive
};
