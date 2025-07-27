const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.get('/register', (req, res) => {
  res.render('register');
});


router.post('/register',
  body('username').trim().isLength({ min: 4 }),
  body('email').trim().isEmail().isLength({ min: 13 }),
  body('password').trim().isLength({ min: 5 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        msg: 'Invalid Data',
      });
    }

    const { username, email, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      username,
      email,
      password: hashPassword,
    });

    return res.redirect('/user/login?success=registered');
  }
);


router.get('/login', (req, res) => {
  res.render('login', { query: req.query });
});



router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await userModel.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax', 
    maxAge: 3600000,
  });

  return res.redirect('/home?msg=loggedin');
});

module.exports = router;
