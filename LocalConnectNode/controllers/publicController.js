// controllers/publicController.js – Public & Informational Page Handlers

exports.getLandingPage = (req, res) => {
  res.render('landing');
};

exports.getAboutPage = (req, res) => {
  res.render('about');
};

exports.getContactPage = (req, res) => {
  res.render('contact');
};

exports.getSignupSuccess = (req, res) => {
  res.render('success', {});
};

exports.getForgotPassword = (req, res) => {
  res.render('forgot_password', {});
};

exports.getResetPassword = (req, res) => {
  res.render('reset_password', { token: req.params.token });
};
