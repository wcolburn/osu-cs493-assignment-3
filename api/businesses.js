const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Business, BusinessClientFields } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { requireAuthentication } = require('../lib/requireAuthentication')

const router = Router()

/*
 * Route to return a list of businesses.
 */
router.get('/', async function (req, res) {
  /*
   * Compute page number based on optional query string parameter `page`.
   * Make sure page is within allowed bounds.
   */
  let page = parseInt(req.query.page) || 1
  page = page < 1 ? 1 : page
  const numPerPage = 10
  const offset = (page - 1) * numPerPage

  const result = await Business.findAndCountAll({
    limit: numPerPage,
    offset: offset
  })

  /*
   * Generate HATEOAS links for surrounding pages.
   */
  const lastPage = Math.ceil(result.count / numPerPage)
  const links = {}
  if (page < lastPage) {
    links.nextPage = `/businesses?page=${page + 1}`
    links.lastPage = `/businesses?page=${lastPage}`
  }
  if (page > 1) {
    links.prevPage = `/businesses?page=${page - 1}`
    links.firstPage = '/businesses?page=1'
  }

  /*
   * Construct and send response.
   */
  res.status(200).json({
    businesses: result.rows,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: result.count,
    links: links
  })
})

/*
 * Route to create a new business.
 */
router.post('/', requireAuthentication, correctUser, async function (req, res, next) {
  try {
    const business = await Business.create(req.body, BusinessClientFields)
    res.status(201).send({ id: business.id })
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
  const userId = req.body.ownerId
  console.log(`Business owner is ${userId} and requester is ${req.user}`)
  if (userId != req.user) {
    res.status(403).send({"error": "Unallowed to post a new business of a user not yourself."})
    return
  } else {
    next()
  }
}

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessId', async function (req, res, next) {
  const businessId = req.params.businessId
  const business = await Business.findByPk(businessId, {
    include: [ Photo, Review ]
  })
  if (business) {
    res.status(200).send(business)
  } else {
    next()
  }
})

/*
 * Route to update data for a business.
 */
router.patch('/:businessId', requireAuthentication, grabAndVerifyCorrectUser, async function (req, res, next) {
  const businessId = req.params.businessId
  const result = await Business.update(req.body, {
    where: { id: businessId },
    fields: BusinessClientFields
  })
  if (result[0] > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

/*
 * Route to delete a business.
 */
router.delete('/:businessId', requireAuthentication, grabAndVerifyCorrectUser, async function (req, res, next) {
  const businessId = req.params.businessId
  const result = await Business.destroy({ where: { id: businessId }})
  if (result > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

// Middleware to check the correct user is accessing this route
async function grabAndVerifyCorrectUser(req, res, next) {
  // const userId = req.body.userId

  const business = await Business.findByPk(req.params.businessId)
  const userId = business.ownerId

  console.log(`Business owner is ${userId} and requester is ${req.user}`)
  if (userId != req.user) {
    res.status(403).send({"error": "Unallowed to edit a business for a user not yourself."})
    return
  } else {
    next()
  }
}

module.exports = router
