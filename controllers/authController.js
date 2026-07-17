const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

async function showLoginPage(req, res) {
  return res.render('users/login', {
    title: 'Login',
    error: req.query.error || null,
    success: req.query.success || null
  });
}

async function showRegisterPage(req, res) {
  return res.render('users/register', {
    title: 'Register',
    error: req.query.error || null
  });
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Email and password are required.'));
    }

    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Invalid email or password.'));
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Invalid email or password.'));
    }

    req.session.userId = user.userID;
    req.session.fullName = user.fullName;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.accountStatus = user.accountStatus;

    return res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send('Unable to login at this time.');
  }
}

async function register(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.redirect('/auth/register?error=' + encodeURIComponent('All fields are required.'));
    }

    const existingUser = await userModel.getUserByEmail(email);

    if (existingUser) {
      return res.redirect('/auth/register?error=' + encodeURIComponent('Email is already registered.'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.createUser(fullName, email, hashedPassword, phone);

    return res.redirect('/auth/login?success=' + encodeURIComponent('Registration successful. Please login.'));
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).send('Unable to register at this time.');
  }
}

async function logout(req, res) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      return res.redirect('/auth/login?success=' + encodeURIComponent('Logged out successfully.'));
    });
  } else {
    return res.redirect('/auth/login?success=' + encodeURIComponent('Logged out successfully.'));
  }
}

module.exports = {
  showLoginPage,
  showRegisterPage,
  login,
  register,
  logout
};
