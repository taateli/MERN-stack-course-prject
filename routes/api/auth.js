const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    test
// @access  Public
router.get('/', auth, async (request, response) => {
  try {
    const user = await User.findById(request.user.id);
    response.json(user);
  } catch (error) {
    console.log(error.message);
    response.status(500).send('Server error');
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please give valid email').isEmail(),
    check('password', 'Password required').exists()
  ],
  async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const { email, password } = request.body;

    try {
      // Check if the user exists. If so send return error
      let user = await User.findOne({ email });

      if (!user) {
        return response
          .status(400)
          .json({ errors: [{ msg: 'Credentials are invalid' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return response
          .status(400)
          .json({ errors: [{ msg: 'Credentials are invalid' }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (error, token) => {
          if (error) throw error;
          response.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      response.status(500).send('Server error');
    }
  }
);

module.exports = router;
