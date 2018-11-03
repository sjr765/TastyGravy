const router = require('express').Router()
const { Order, LineItem, Product } = require('../db/models')
module.exports = router

router.get('/', async (req, res, next) => {
  try {
    const allLineItems = await LineItem.findAll({
      include: [{ all: true }]
    })
    res.json(allLineItems)
  } catch (err) {
    next(err)
  }
})

// May be put in its own cart API route?
router.get('/cart', async (req, res, next) => {
  try {
    let cartItems
    if (req.user) {
      cartItems = await LineItem.findAll({
        where: {
          userId: req.user.id,
          status: 'cart'
        },
        include: [Product]
      })
    }

    // else get the cart from the session? does that belong here?
    res.json(cartItems)
  } catch (err) {
    next(err)
  }
})

router.put('/checkout', async (req, res, next) => {
  console.log(`in the checkout API route`)
  try {
    let checkedOutItems
    let orderNumber
    if (req.user) {
      checkedOutItems = await LineItem.findAll({ //get all items for user in cart
        where: {
          userId: req.user.id,
          status: 'cart'
        },
        include: [Product]
      })

      orderNumber = await Order.create({ userId: req.user.id, datePurchased: new Date() })
      console.log(`this is orderNumber.id `, orderNumber.id)


      // await checkedOutItems.set()

      await checkedOutItems.forEach(item => item.update({
        status: 'purchased',
        orderId: orderNumber.id
      }))
    }
    console.log('here is checked out items', checkedOutItems)
    res.json(checkedOutItems)
  } catch (err) {
    next(err)
  }
})



router.post('/', async (req, res, next) => {
  try {
    const { quantity, productId, price } = req.body
    if (req.user) {
      const newItem = await LineItem.create({
        quantity,
        status: 'cart',
        productId,
        userId: req.user.id,
        price,
      })
      newItem.dataValues.product = await Product.findOne({
        where: { id: productId }
      })
      res.json(newItem)
    } else {
      res.status(403).send()
    }
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const { quantity, productId } = req.body
    if (req.user) {
      const oldItemQuantity = LineItems.findOne({
        where: { id: itemId },
        attributes: ['quantity']
      })
      const updatedItem = await LineItem.update({ quantity: oldItemQuantity + quantity })
      res.json(newItem)
    } else {
      res.status(403).send()
    }
  } catch (err) {
    next(err)
  }
})

router.delete('/:itemId', async (req, res, next) => {
  try {
    await LineItem.destroy({ where: { id: req.params.itemId } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
