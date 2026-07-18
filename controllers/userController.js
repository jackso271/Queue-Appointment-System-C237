const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

// GET /user/profile
async function showProfile(req, res) {
  try {
    const user = await userModel.getUserById(req.session.userId);
    return res.render('user/profile', {
      title: 'My Profile',
      user,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('showProfile error:', error);
    return res.status(500).send('Unable to load profile at this time.');
  }
}

// GET /user/edit
async function showEditForm(req, res) {
  try {
    const user = await userModel.getUserById(req.session.userId);
    return res.render('user/edit', {
      title: 'Edit Profile',
      user,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('showEditForm error:', error);
    return res.status(500).send('Unable to load profile at this time.');
  }
}

// POST /user/edit  — DB interaction 5: update profile information
async function updateProfile(req, res) {
  try {
    const { fullName, phone } = req.body;

    if (!fullName) {
      return res.redirect('/user/edit?error=' + encodeURIComponent('Full name is required.'));
    }

    await userModel.updateProfile(req.session.userId, fullName, phone);

    // Keep session in sync with the new value
    req.session.fullName = fullName;

    return res.redirect('/user/profile?success=' + encodeURIComponent('Profile updated successfully.'));
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.redirect('/user/edit?error=' + encodeURIComponent('Unable to update profile at this time.'));
  }
}

// GET /user/change-password
function showChangePasswordForm(req, res) {
  return res.render('user/change-password', {
    title: 'Change Password',
    error: req.query.error || null
  });
}

// POST /user/change-password  — DB interaction 4: update hashed password
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.redirect('/user/change-password?error=' + encodeURIComponent('All fields are required.'));
    }

    if (newPassword !== confirmPassword) {
      return res.redirect('/user/change-password?error=' + encodeURIComponent('New passwords do not match.'));
    }

    if (newPassword.length < 8) {
      return res.redirect('/user/change-password?error=' + encodeURIComponent('New password must be at least 8 characters.'));
    }

    // Need the stored hash to verify the current password — email is
    // already in the session from login, so DB interaction 2 covers this.
    const fullUser = await userModel.getUserByEmail(req.session.email);
    const matches = await bcrypt.compare(currentPassword, fullUser.password);

    if (!matches) {
      return res.redirect('/user/change-password?error=' + encodeURIComponent('Current password is incorrect.'));
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(req.session.userId, newHashedPassword);

    return res.redirect('/user/profile?success=' + encodeURIComponent('Password updated successfully.'));
  } catch (error) {
    console.error('changePassword error:', error);
    return res.redirect('/user/change-password?error=' + encodeURIComponent('Unable to update password at this time.'));
  }
}

module.exports = {
  showProfile,
  showEditForm,
  updateProfile,
  showChangePasswordForm,
  changePassword
};