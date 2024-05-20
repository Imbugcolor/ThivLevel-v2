const router = require("express").Router();
require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const Cart = require('../models/cartModel')
const Users = require('../models/userModels')
const Products = require('../models/productsModel')
const Payments = require('../models/paymentModel')
const auth = require('../middleware/auth')

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID } =
  process.env;
const base = "https://api-m.sandbox.paypal.com";

let ordersDataTransaction = []
/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * See https://developer.paypal.com/api/rest/authentication/
 */
const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
    ).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

/**
 * Generate a client token for rendering the hosted card fields.
 * See https://developer.paypal.com/docs/checkout/advanced/sdk/v1/#link-integratebackend
 */
const generateClientToken = async () => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v1/identity/generate-token`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Accept-Language": "en_US",
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

/* verify webhook */
async function verifyWebhook(headers, webhookEvent) {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(
    "https://api.sandbox.paypal.com/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: webhookEvent,
      }),
    }
  );

  const body = await response.json();
  return body.verification_status === "SUCCESS";
}

/**
 * Create an order to start the transaction.
 * See https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (data, res) => {
  // use the cart information passed from the front-end to calculate the purchase unit details
  console.log(
    "shopping cart information passed from the frontend createOrder() callback:",
    data
  );

  const userId = data.user_id;

  const { total_price } = await getCartItems(userId, res)

  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders`;
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: total_price.toFixed(2),
        },
        custom_id: userId, // Example of custom data
      },
    ],
    application_context: {
      shipping_preference: "NO_SHIPPING",
    },
  };

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  try {
    const jsonResponse = await response.json();

    ordersDataTransaction.push({ socketId: data.socketId, userId, phone: data.phone, name: data.name, address: data.address })
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
};

/**
 * Capture payment for the created order to complete the transaction.
 * See https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;
  
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
        // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
      },
    });
  
    return handleResponse(response);
};

async function handleResponse(response) {
    try {
      const jsonResponse = await response.json();
      return {
        jsonResponse,
        httpStatusCode: response.status,
      };
    } catch (err) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
}

const getCartItems = async (id, res) => {
    try {
      const carts = await Cart.find({userId: id}).populate({
          path: "items.productId",
          select: "product_id price total title images countInStock isPublished"
        });
      
        let cart = carts[0]
        
        if (!cart) {
          return res.status(400).json({ msg: 'Invalid cart.' })
        }
         
        const cartItems = []

        cart.items.map(item => {
            const { productId, size, color, price, quantity } = item
            const obj = { product_id: productId.product_id, size, color, price, quantity, title: productId.title, images: productId.images }
            cartItems.push(obj)
        })
        return { total_price: cart.subTotal, cartItems };
    } catch (err) {
      console.log(err)
      return res.status(500).json({ msg: err.message })
    }
} 

// save order to DB 
const submitOrder = async(userId, total_price, res) => {
    try {
        const user = await Users.findById(userId).select('name email')

        if(!user) 
            return res.status(400).json({msg: 'User does not exist.'})

        const {_id, email} = user;

        const reverseData = ordersDataTransaction.reverse()
        const orderData = reverseData.find(order => order.userId === userId)

        const { cartItems } = await getCartItems(userId, res)
        const cart = cartItems
        
        const newPayment = new Payments({
            user_id: _id, name: orderData.name, email, cart, paymentID: orderData.id, address: orderData.address, total: total_price, phone: orderData.phone, method: 'PAYPAL_CREDIT_CARD', isPaid: true
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

        let emptyCart = await Cart.findOne({ userId })
        emptyCart.items = [];
        emptyCart.subTotal = 0
        await emptyCart.save();  

        global._io.to(`${orderData.socketId}`).emit('ORDER_SUCCESS')

        ordersDataTransaction = ordersDataTransaction.filter(order => order.userId === userId)

    } catch (err) {
        console.log(err)
        global._io.to(`${orderData.socketId}`).emit('ORDER_FAILED', { msg: err.message })
        return res.status(500).json({ msg: err.message })
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


router.get("/paypal/generate-token",auth, async (req, res) => {
    try {
      const { jsonResponse } = await generateClientToken();
      res.status(200).json({
        clientId: PAYPAL_CLIENT_ID,
        clientToken: jsonResponse.client_token,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
});
  
router.post("/orders", async (req, res) => {
    try {
      // use the cart information passed from the front-end to calculate the order amount detals
      const { data } = req.body;
      const { jsonResponse, httpStatusCode } = await createOrder(data, res);
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      return res.status(500).json({ error: "Failed to create order." });
    }
});
  
router.post("/orders/:orderID/capture", async (req, res) => {
    try {
      const { orderID } = req.params;
      const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      return res.status(500).json({ error: "Failed to capture order." });
    }
});
  
router.post('/paypalwebhook', async (req, res) => {
    const webhookEvent = req.body;
    const userId = webhookEvent.resource.custom_id;
    const total_price = webhookEvent.resource.amount.value;
    const reverseData = ordersDataTransaction.reverse()
    const socketId = reverseData.find(order => order.userId === userId).socketId
    try {
      const isValid = await verifyWebhook(req.headers, webhookEvent);
      if (isValid) {
        // Process the webhook event
        console.log('Webhook event', webhookEvent);
  
        if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
          await submitOrder(userId, Number(total_price), res)
        }
      } else {
        global._io.to(`${socketId}`).emit('ORDER_FAILED', { msg: 'Server Error: Invalid webhook event' })
        console.log('Invalid webhook event');
      }
    } catch (error) {
      global._io.to(`${socketId}`).emit('ORDER_FAILED', { msg: 'Server Error: Invalid webhook event' })
      console.error('Error verifying webhook', error);
    }
  
    res.sendStatus(200);
});

module.exports = router
