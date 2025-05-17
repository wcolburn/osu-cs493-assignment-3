const { Router } = require('express')
const { ValidationError } = require('sequelize')
const { requireAuthentication } = require('../lib/requireAuthentication')

const { Photo, PhotoClientFields } = require('../models/photo')

const router = Router()

/*
 * Route to create a new photo.
 */
router.post('/', requireAuthentication, correctUser, async function (req, res, next) {
  try {
    const photo = await Photo.create(req.body, PhotoClientFields)
    res.status(201).send({ id: photo.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }
})

// Middleware to check the correct user is accessing this route
function correctUser(req, res, next) {
  const userId = req.body.userId
  console.log(`Photo owner is ${userId} and requester is ${req.user}`)
  if (userId != req.user) {
    res.status(403).send({"error": "Unallowed to post a photo of a user not yourself."})
    return
  } else {
    next()
  }
}

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoId', async function (req, res, next) {
  const photoId = req.params.photoId
  const photo = await Photo.findByPk(photoId)
  if (photo) {
    res.status(200).send(photo)
  } else {
    next()
  }
})

/*
 * Route to update a photo.
 */
router.patch('/:photoId', requireAuthentication, grabAndVerifyCorrectUser, async function (req, res, next) {
  const photoId = req.params.photoId

  /*
   * Update photo without allowing client to update businessId or userId.
   */
  const result = await Photo.update(req.body, {
    where: { id: photoId },
    fields: PhotoClientFields.filter(
      field => field !== 'businessId' && field !== 'userId'
    )
  })
  if (result[0] > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

/*
 * Route to delete a photo.
 */
router.delete('/:photoId', requireAuthentication, grabAndVerifyCorrectUser, async function (req, res, next) {
  const photoId = req.params.photoId
  const result = await Photo.destroy({ where: { id: photoId }})
  if (result > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

// Middleware to check the correct user is accessing this route
async function grabAndVerifyCorrectUser(req, res, next) {

  const photo = await Photo.findByPk(req.params.photoId)
  console.log(`photo ${req.params.photoId} retrieved: ${photo}`)
  const userId = photo.userId

  console.log(`Business owner is ${userId} and requester is ${req.user}`)
  if (userId != req.user) {
    res.status(403).send({"error": "Unallowed to edit a photo for a user not yourself."})
    return
  } else {
    next()
  }
}

module.exports = router
