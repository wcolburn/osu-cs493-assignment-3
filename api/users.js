const { Router } = require('express')
const { ValidationError } = require('sequelize')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { User, UserClientFields } = require('../models/user')

const router = Router()

/*
 * Route to register a new user.
 */
router.post('/', async function (req, res) {
  try {
      const user = await User.create(req.body, UserClientFields)
      res.status(201).send({ id: user.id })
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message })
      } else {
        throw e
      }
    }
})

/*
 * Route for a user to login, recieving a JWT token.
 */
router.post('/login', async function (req, res) {
  try {
    const email = req.body.email
    const login_pass = req.body.password

    // Grab the user from the database
    const user = await User.findOne({ where: { email: email } })
    if (!user) {
      return res.status(403).send({"error": "Incorrect email"})
    }

    // Check password
    const passwords_match = await bcrypt.compare(login_pass, user.password);
    if (!passwords_match) {
      return res.status(403).send({"error": "Incorrect password"})
    }

    // Return 200 OK with JWT token
    const payload = { "sub": user.id };
    const expiration = { "expiresIn": "24h" };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, expiration);
    res.status(200).send({"status": "ok", "token": token});

  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }
})

// Middleware checking the request has correct authentication for the route
function requireAuthentication(req, res, next) {
    const token = req.get('Authorization');
    if (!token) {
        return res.status(403).send({"error": "missing Authorization"});
    } else {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
            // if we get here, success
            req.user = payload.sub;
            next();
        } catch(err) {
            // this means we failed
            return res.status(403).send({"error": "incorrect token"});
        }
    }
}

// Middleware to check the correct user is accessing this route
function correctUser(req, res, next) {
    const userId = req.params.userId
  if (userId != req.user) {
    res.status(403).send({"error": "Unallowed to access the data of a user not yourself."})
    return
  } else {
    next()
  }
}

/*
 * Route to get a user.
 */
router.get('/:userId', requireAuthentication, correctUser, async function (req, res, next) {
  const user = await User.findByPk(req.params.userId, {
    attributes: ['id', 'name', 'email', 'admin']
  })
  if (user) {
    res.status(200).send(user)
  } else {
    res.status(404).send({ error: "User not found" });
  }
})

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAuthentication, correctUser, async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuthentication, correctUser, async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuthentication, correctUser, async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
})

module.exports = router
