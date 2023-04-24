const Users = require('../models/userModels')
const express = require('express')
const router = require('express').Router()
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const Products = require('../models/productsModel')
const Payments = require('../models/paymentModel')
const Cart = require('../models/cartModel')
const auth = require('../middleware/auth')

// Create Checkout Session = Stripe to Payment 
router.post('/create-checkout-session',auth, async(req, res) =>{
    try {
        const customer = await stripe.customers.create({
            metadata: {
                name: req.body.name,
                user_id: req.user.id,
                cart: JSON.stringify(req.body.cartItems),
                phone: req.body.phone,
                address: JSON.stringify(req.body.address)
            },
        }) 
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: item.productId.title,
                            images: [item.productId.images[0].url]
                        },
                        unit_amount: item.price * 100,
                    },
                    quantity: item.quantity
                }
            }),
            customer: customer.id,
            success_url: `${process.env.CLIENT_CART_URL}?success=true`,
            cancel_url: `${process.env.CLIENT_CART_URL}?canceled=true`,
        })
        res.json({url: session.url, status: session.payment_status})
    } catch (err) {
        res.status(500).json({msg: err.message})
    }  
})

// Create Order Detail Into DB when payment Success
const createOrder = async(customer,data) => {
    try {
        const user = await Users.findById(customer.metadata.user_id).select('name email')

        if(!user) 
            return res.status(400).json({msg: 'User does not exist.'})

        const {_id, email} = user;

        const cart = JSON.parse(customer.metadata.cart)
        const address = JSON.parse(customer.metadata.address)
        
        const newCart = await Promise.all(cart.map(async(item) => {
            const product = await Products.findOne({product_id: item.product_id})
            const { title, images } = product
            return { ...item, title, images }     
        }))

        const newPayment = new Payments({
            user_id: _id, name: customer.metadata.name, email, cart: newCart, paymentID: data.payment_intent, address, total: data.amount_total / 100, phone: customer.metadata.phone, method: 'Online', isPaid: true
        })



        const groupBy = function(xs, id) {
            return xs.reduce(function(rv, x) {
              (rv[x[id]] = rv[x[id]] || []).push(x);
              return rv;
            }, {});
        };

        const groupByItem = groupBy(cart, 'product_id')

        Object.keys(groupByItem).forEach(id => {
            const sumQuantity = groupByItem[id].reduce((acc, curr) => {
              return acc + curr.quantity
            },0)  
            return sold(id, sumQuantity)
        });
        
        await newPayment.save()

        // Clear Cart when complete payment

        let emptyCart = await Cart.findOne({ userId: customer.metadata.user_id})
        emptyCart.items = [];
        emptyCart.subTotal = 0
        await emptyCart.save();  

    } catch (err) {
        console.log(err)
    }
}

const sold = async(id, quantity) => {
    const product = await Products.findOne({product_id: id})
    const oldSold = product.sold
    const inStock = product.countInStock
    await Products.findOneAndUpdate({product_id: id}, {
        sold: quantity + oldSold, countInStock: inStock - quantity
    })
}

let endpointSecret;
// endpointSecret = 'whsec_81aefdfbbf573f1aa7a38dab0365c9616d8d38520bfaca71420235b6d76e0905';
// Match the raw body to content type application/json
// If you are using Express v4 - v4.16 you need to use body-parser, not express, to retrieve the req body
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    let data;
    let eventType;

    if(endpointSecret) {

        let event;
      
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
          console.log("Webhook verified.")
        }
        catch (err) {
          console.log(`Webhook Error: ${err.message}`)
          res.status(400).send(`Webhook Error: ${err.message}`);
          return;
        }

        data = event.data.object;
        eventType = event.type;
    } else {
        data = req.body.data.object
        eventType = req.body.type
    }
  
    //Handle the event
    if(eventType === 'checkout.session.completed') {
        stripe.customers
            .retrieve(data.customer)
            .then((customer) => {
                createOrder(customer, data)
            }).catch((err) => console.log(err.message))
    }
  
    // Return a res to acknowledge receipt of the event
    res.send().end()
});
  

module.exports = router