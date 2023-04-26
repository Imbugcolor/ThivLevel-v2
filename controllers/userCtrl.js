const Users = require('../models/userModels')
const Payments = require('../models/paymentModel')
const CartCtrl = require('../controllers/cartCtrl')
const Cart = require('../models/cartModel')
const Products = require('../models/productsModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer")
const twilioConfig = require('./twilioConfig')
const otp = require('twilio')(twilioConfig.accountSID, twilioConfig.authToken)


class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString } //queryString = req.query
    // console.log({before: queryObj}) // before delete params

    const excludedFields = ['sort']
    excludedFields.forEach(el => delete (queryObj[el]))

    // console.log({after: queryObj}) //after delete params

    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)
    // lte, gte = less/greater than or equal
    // lt, gt = less/greater than
    // regex = compare ~ string 
    // console.log({queryStr})

    this.query.find(JSON.parse(queryStr))

    return this;
  }
  sorting() {

    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join('')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }

    return this;
  }
}

const increment = (data, id) => {
  const newData = data.map(item => 
      (item._id === id ? item.quantity += 1  : item)
  )
  return newData;
}

const DeleteData = (data, id) => {
  const newData = data.filter(item => item._id !== id)
  return newData;
}

const userCtrl = {
  register: async (req, res) => {
    try {
      const { username, email, password, verify_password } = req.body;
      if (!ValidateEmail(email)) return res.status(400).json({ msg: "Email không hợp lệ" })
      const user = await Users.findOne({ email })
      if (user) return res.status(400).json({ msg: "Email này đã được đăng ký" })

      if (password.length < 6)
        return res.status(400).json({ msg: 'Mật khẩu phải tổi thiểu 6 ký tự' })
      
      if (password.match(/^(?=.*\s)/))
        return res.status(400).json({ msg: 'Mật khẩu không được chứa khoảng cách' })

      if (!ValidatePassword(password)) 
        return res.status(400).json({ msg: "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa, 1 chữ cái thường và một chữ số" })
      
      
      if (password !== verify_password)
        return res.status(400).json({ msg: 'Xác nhận mật khẩu chưa đúng' })

      //Password Encrypt
      const passwordHash = await bcrypt.hash(password, 10)

      const newUser = new Users({
        username, email, password: passwordHash
      })

      //save to database
      await newUser.save()

      //Then create jsonwebtoken to authentication
      const accesstoken = createAccessToken({ id: newUser._id })
      const refreshtoken = createRefreshToken({ id: newUser._id })

      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refresh_token',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      res.json({ accesstoken })
      // res.json({msg: "Register success!"})

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!ValidateEmail(email)) return res.status(400).json({ msg: "Email không hợp lệ" })

      const user = await Users.findOne({ email })
      if (!user) return res.status(400).json({ msg: "Tài khoản không tồn tại." })

      if (!user.status) return res.status(400).json({ msg: "Tài khoản đã tạm thời bị khóa." })

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) return res.status(400).json({ msg: "Sai mật khẩu." })

      //If login success, create access token and refresh token
      const accesstoken = createAccessToken({ id: user._id })
      const refreshtoken = createRefreshToken({ id: user._id })

      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refresh_token',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      res.json({ accesstoken })
    } catch (err) {

      return res.status(500).json({ msg: err.message })

    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', { path: '/user/refresh_token' })
      return res.json({ msg: 'Logged out' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) return res.status(400).json({ msg: "Please Login or Register" })
      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(400).json({ msg: "Please Login or Register" })
        const accesstoken = createAccessToken({ id: user.id })
        res.json({ user, accesstoken })
      })

      res.json({ rf_token })
    } catch (err) {

    }

  },
  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select('-password')
      if (!user) return res.status(400).json({ msg: 'User does not exist.' })

      res.json(user)
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getAllUser: async (req, res) => {
    try {
      const allUser = await Users.find(req.query)

      res.json(allUser)

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updateUser: async (req, res) => {
    try {
      const { username, email, address, gender, dateOfbirth, imageProfile } = req.body;

      await Users.findOneAndUpdate({ _id: req.user.id }, {
        username, email, address, gender, dateOfbirth, imageProfile
      })

      res.json('Updated your profile')

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updatePhone: async (req, res) => {
    try {
      const { phone } = req.body;
      if (phone.length < 9) return res.status(400).json({ msg: 'Số điện thoại không hợp lệ.' })
      await Users.findOneAndUpdate({ _id: req.user.id }, {
        phone, isVerifyPhone: false
      })

      res.json('Updated your phone')

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getCart: async (req, res) => {
    try {
        const carts = await Cart.find({userId: req.user.id}).populate({
          path: "items.productId",
          select: "product_id price total title images countInStock isPublished"
        });
     
        let cart = carts[0]
       
        if (!cart) {
            const cartData = {
              userId: req.user.id,
              items: [],
              subTotal: 0
            }
            cart = await CartCtrl.addItem(cartData)
        }
        else{
          await Promise.all(cart.items.map(async(item) => {
            if(!item.productId) {
              await Cart.findOneAndUpdate({userId: req.user.id},
                {
                  "$pull": {
                    "items": {
                      "_id": item._id
                    }
                  }
                }
              ).populate({
                path: "items.productId",
                select: "product_id price total title images countInStock isPublished"
              });
               
              let newCart = await Cart.findOne({userId: req.user.id}).populate({
                path: "items.productId",
                select: "product_id price total title images countInStock isPublished"
              });
              
              newCart.items.length === 0  ?  newCart.subTotal = 0 :
              newCart.subTotal = newCart.items.map(item => item.total).reduce((acc, next) => acc + next);
        
              cart = await newCart.save();
            }
          }))
        }

        res.status(200).json({cart})
    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
  },
  addCart: async (req, res) => {
    const {
      productId, color, size
    } = req.body;
    const quantity = Number.parseInt(req.body.quantity);
    try {
        let carts = await Cart.find({userId: req.user.id}).populate({
          path: "items.productId",
          select: "product_id price total title images countInStock isPublished"
        });;

        let cart = carts[0]

        let productDetails = await Products.findById(productId)

        if (!productDetails) {
          return res.status(400).json({msg: "Invalid request"})
        }
        //--If Cart Exists ----
        if (cart) {
            //---- check if index exists ----
            const indexFound = cart.items.findIndex(item => item.productId.id == productId && item.color == color && item.size == size);
            //------this removes an item from the the cart if the quantity is set to zero,We can use this method to remove an item from the list  -------
            if (indexFound !== -1 && quantity <= 0) {
                cart.items.splice(indexFound, 1);
                if (cart.items.length == 0) {
                    cart.subTotal = 0;
                } else {
                    cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                }
            }
            //----------check if product exist,just add the previous quantity with the new quantity and update the total price-------
            else if (indexFound !== -1) {
                cart.items[indexFound].quantity = cart.items[indexFound].quantity + quantity;
                cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
                cart.items[indexFound].price = productDetails.price
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            //----Check if Quantity is Greater than 0 then add item to items Array ----
            else if (quantity > 0) {
                cart.items.push({
                    productId: productId,
                    quantity: quantity,
                    price: productDetails.price,
                    color, size,
                    total: parseInt(productDetails.price * quantity)
                })
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            //----if quantity of price is 0 throw the error -------
            else {
                return res.status(400).json({
                    msg: "Invalid request"
                })
            }

            let data = await cart.save();

            res.status(200).json({
                msg: "Process Successful",
                data: data
            })
        }
        //------------ if there is no user with a cart...it creates a new cart and then adds the item to the cart that has been created------------
        else {
            const cartData = {
                userId: req.user.id,
                items: [{
                    productId: productId,
                    quantity: quantity,
                    total: parseInt(productDetails.price * quantity),
                    price: productDetails.price,
                    color, size
                }],
                subTotal: parseInt(productDetails.price * quantity)
            }
            cart = await CartCtrl.addItem(cartData)
            // let data = await cart.save();
            res.json(cart);
        }
    } catch (err) {
        res.status(500).json({msg: err.message})
    }
  },
  incrementCart: async (req, res) => {
    try {

      const { id, newItems } = req.body

      let cart = await Cart.findById(id)
    
      let productDetails = await Products.findById(newItems.productId)

      const indexFound = cart.items.findIndex(item => item._id == newItems._id)
      
      if (indexFound !== -1) {
        cart.items[indexFound].quantity = cart.items[indexFound].quantity + 1;
        cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
        cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
      }
      
      let data = await cart.save();

      res.json({msg: 'success', data: data})

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  decrementCart: async (req, res) => {
    try {

      const { id, newItems } = req.body

      let cart = await Cart.findById(id)
      
      let productDetails = await Products.findById(newItems.productId)

      const indexFound = cart.items.findIndex(item => item._id == newItems._id)
      
      if (indexFound !== -1) {
        cart.items[indexFound].quantity = cart.items[indexFound].quantity - 1;
        cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
        cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
      }
      
      let data = await cart.save();

      res.json({msg: 'success', data: data})

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  deleteItemCart: async (req, res) => {
    try {

      const { id, item } = req.body

      await Cart.findOneAndUpdate({_id: id},
        {
          "$pull": {
            "items": {
              "_id": item._id
            }
          }
        }
      )

      let newCart = await Cart.findById(id)

      newCart.items.length === 0  ?  newCart.subTotal = 0 :
      newCart.subTotal = newCart.items.map(item => item.total).reduce((acc, next) => acc + next);

      let data = await newCart.save();
      
      res.json({msg: 'success', data: data})

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  emptyCart: async (req, res) => {
    try {
        const { id } = req.body  
        let cart = await Cart.findById(id)
        cart.items = [];
        cart.subTotal = 0
        let data = await cart.save();
        res.status(200).json({
            msg: "Cart Has been emptied",
            data: data
        })
    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
  },
  validCart: async (req, res) => {
    try {
        const { id } = req.body  
        let cart = await await Cart.findById(id)
        const products = await Products.find()

        const isValid = () => {
          let count = 0;
          cart.items.forEach(item => {
              products.find(p => {
                if (p._id.toString() === item.productId._id.toString()) {
                  const totalQuantity = cart.items.reduce((acc, curr) => {
                      return (curr.productId._id.toString() == p._id.toString()) ? acc + curr.quantity : acc
                  }, 0)
                  
                  if (p.countInStock < totalQuantity) {
                      count = count + 1;
                      return false
                  }
                }           
            })
          })
          if(count > 0) return false
          return true
        }
        

        if(!isValid()) {
          return res.status(400).json({ msg: 'Lỗi thanh toán, một số sản phẩm không đủ số lượng.' })
        }

        const isActive = () => {
          let count = 0;
          cart.items.forEach(item => {
              products.find(p => {
                if (p._id.toString() === item.productId._id.toString()) {
                  if (!p.isPublished) {
                      count = count + 1;
                      return false
                  }
                }           
            })
          })
          if(count > 0) return false
          return true
        } 

        if(!isActive()) {
          return res.status(400).json({ msg: 'Lỗi thanh toán, một số sản phẩm không còn tồn tại.' })
        }

        res.status(200).json({
            msg: "Success.",
        })
    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
  },
  history: async (req, res) => {
    try {
      const features = new APIfeatures(Payments.find({ user_id: req.user.id }), req.query).filtering().sorting()
      const history = await features.query
      // const history = await Payments.find({user_id: req.user.id})

      res.json(history)
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  googleAuthLogin: async (req, res) => {
    try {
      const { name, email, imageUrl, accessToken } = req.body;
      const user = await Users.findOne({ email })
      if (user) {

        //Password Encrypt
        const passwordHash = await bcrypt.hash(accessToken, 10)

        await Users.findOneAndUpdate({ email }, {
          password: passwordHash
        })
        //If login success, create access token and refresh token
        const accesstoken = createAccessToken({ id: user._id })
        const refreshtoken = createRefreshToken({ id: user._id })

        res.cookie('refreshtoken', refreshtoken, {
          httpOnly: true,
          path: '/user/refresh_token',
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.json({ accesstoken })
        return;
      }

      //Password Encrypt
      const passwordHash = await bcrypt.hash(accessToken, 10)

      const newUser = new Users({
        username: name, email, imageProfile: { url: imageUrl }, password: passwordHash, isLogSocialNetwork: true,
      })

      //save to database
      await newUser.save()

      //Then create jsonwebtoken to authentication
      const accesstoken = createAccessToken({ id: newUser._id })
      const refreshtoken = createRefreshToken({ id: newUser._id })

      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refresh_token',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      res.json({ accesstoken })
      // res.json({msg: "Register success!"})

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  facebookAuthLogin: async (req, res) => {
    try {
      const { name, email, imageUrl, accessToken } = req.body;
      const user = await Users.findOne({ email })
      if (user) {

        //Password Encrypt
        const passwordHash = await bcrypt.hash(accessToken, 10)

        await Users.findOneAndUpdate({ email }, {
          password: passwordHash
        })
        //If login success, create access token and refresh token
        const accesstoken = createAccessToken({ id: user._id })
        const refreshtoken = createRefreshToken({ id: user._id })

        res.cookie('refreshtoken', refreshtoken, {
          httpOnly: true,
          path: '/user/refresh_token',
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.json({ accesstoken })
        return;
      }

      //Password Encrypt
      const passwordHash = await bcrypt.hash(accessToken, 10)

      const newUser = new Users({
        username: name, email, imageProfile: { url: imageUrl }, password: passwordHash, isLogSocialNetwork: true,
      })

      //save to database
      await newUser.save()

      //Then create jsonwebtoken to authentication
      const accesstoken = createAccessToken({ id: newUser._id })
      const refreshtoken = createRefreshToken({ id: newUser._id })

      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refresh_token',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      res.json({ accesstoken })
      // res.json({msg: "Register success!"})

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword, verifyPassword } = req.body;

      const user = await Users.findOne({ _id: req.user.id })

      if (!user) return res.status(400).json({ msg: "User does not exist." })

      const isMatch = await bcrypt.compare(oldPassword, user.password)

      if (!isMatch) return res.status(400).json({ msg: "Mật khẩu hiện tại chưa đúng" })

      if (oldPassword === newPassword)
        return res.status(400).json({ msg: "Mật khẩu mới không được trùng với mật khẩu hiện tại" })
      if (newPassword.length < 6)
        return res.status(400).json({ msg: 'Mật khẩu có ít nhất 6 ký tự' })
      if (newPassword.match(/^(?=.*\s)/))
        return res.status(400).json({ msg: 'Mật khẩu không được chứa khoảng cách' })
      if (!ValidatePassword(newPassword)) 
        return res.status(400).json({ msg: "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa, 1 chữ cái thường và một chữ số" })
      if (newPassword !== verifyPassword)
        return res.status(400).json({ msg: 'Xác nhận mật khẩu chưa đúng' })
      //Password Encrypt
      const passwordHash = await bcrypt.hash(newPassword, 10)

      await Users.findOneAndUpdate({ _id: req.user.id }, {
        password: passwordHash
      })

      return res.json({ msg: "Đổi mật khẩu thành công" })


    } catch (err) {

      return res.status(500).json({ msg: err.message })

    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body
      const oldUser = await Users.findOne({ email })
      if (!oldUser) {
        return res.status(400).json({ msg: 'User Not Exists.' })
      }
      const secret = process.env.CHANGE_PASSWORD_SECRET + oldUser.password
      const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: '5m' })
      const link = `${process.env.LINK_TO_RESET_PASSWORD}/${oldUser._id}/${token}`
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USERNAME, // generated ethereal user
          pass: process.env.MAIL_PASSWORD_APP, // generated ethereal password
        },
      });

      // send mail with defined transport object
      await transporter.sendMail({
        from: 'vt.shop@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Xác nhận khôi phục mật khẩu tài khoản ThivLevel", // Subject line
        // text: link, // plain text body
        html: `<html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                  <title>Simple Transactional Email</title>
                  <style>
                    /* -------------------------------------
                        GLOBAL RESETS
                    ------------------------------------- */
                    
                    /*All the styling goes here*/
                    
                    img {
                      border: none;
                      -ms-interpolation-mode: bicubic;
                      max-width: 100%; 
                    }
              
                    body {
                      background-color: #f6f6f6;
                      font-family: sans-serif;
                      -webkit-font-smoothing: antialiased;
                      font-size: 14px;
                      line-height: 1.4;
                      margin: 0;
                      padding: 0;
                      -ms-text-size-adjust: 100%;
                      -webkit-text-size-adjust: 100%; 
                    }
              
                    table {
                      border-collapse: separate;
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      width: 100%; }
                      table td {
                        font-family: sans-serif;
                        font-size: 14px;
                        vertical-align: top; 
                    }
              
                    /* -------------------------------------
                        BODY & CONTAINER
                    ------------------------------------- */
              
                    .body {
                      background-color: #f6f6f6;
                      width: 100%; 
                    }
              
                    /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
                    .container {
                      display: block;
                      margin: 0 auto !important;
                      /* makes it centered */
                      max-width: 580px;
                      padding: 10px;
                      width: 580px; 
                    }
              
                    /* This should also be a block element, so that it will fill 100% of the .container */
                    .content {
                      box-sizing: border-box;
                      display: block;
                      margin: 0 auto;
                      max-width: 580px;
                      padding: 10px; 
                    }
              
                    /* -------------------------------------
                        HEADER, FOOTER, MAIN
                    ------------------------------------- */
                    .main {
                      background: #ffffff;
                      border-radius: 3px;
                      width: 100%; 
                    }
              
                    .wrapper {
                      box-sizing: border-box;
                      padding: 20px; 
                    }
              
                    .content-block {
                      padding-bottom: 10px;
                      padding-top: 10px;
                    }
              
                    .footer {
                      clear: both;
                      margin-top: 10px;
                      text-align: center;
                      width: 100%; 
                    }
                      .footer td,
                      .footer p,
                      .footer span,
                      .footer a {
                        color: #999999;
                        font-size: 12px;
                        text-align: center; 
                    }
              
                    /* -------------------------------------
                        TYPOGRAPHY
                    ------------------------------------- */
                    h1,
                    h2,
                    h3,
                    h4 {
                      color: #000000;
                      font-family: sans-serif;
                      font-weight: 400;
                      line-height: 1.4;
                      margin: 0;
                      margin-bottom: 30px; 
                    }
              
                    h1 {
                      font-size: 35px;
                      font-weight: 300;
                      text-align: center;
                      text-transform: capitalize; 
                    }
              
                    p,
                    ul,
                    ol {
                      font-family: sans-serif;
                      font-size: 14px;
                      font-weight: normal;
                      margin: 0;
                      margin-bottom: 15px; 
                    }
                      p li,
                      ul li,
                      ol li {
                        list-style-position: inside;
                        margin-left: 5px; 
                    }
              
                    a {
                      color: #3498db;
                      text-decoration: underline; 
                    }
              
                    /* -------------------------------------
                        BUTTONS
                    ------------------------------------- */
                    .btn {
                      box-sizing: border-box;
                      width: 100%; }
                      .btn > tbody > tr > td {
                        padding-bottom: 15px; }
                      .btn table {
                        width: auto; 
                    }
                      .btn table td {
                        background-color: #ffffff;
                        border-radius: 5px;
                        text-align: center; 
                    }
                      .btn a {
                        background-color: #ffffff;
                        border: solid 1px #3498db;
                        border-radius: 5px;
                        box-sizing: border-box;
                        color: #3498db;
                        cursor: pointer;
                        display: inline-block;
                        font-size: 14px;
                        font-weight: bold;
                        margin: 0;
                        padding: 12px 25px;
                        text-decoration: none;
                        text-transform: capitalize; 
                    }
              
                    .btn-primary table td {
                      background-color: #3498db; 
                    }
              
                    .btn-primary a {
                      background-color: #3498db;
                      border-color: #3498db;
                      color: #ffffff; 
                    }
              
                    /* -------------------------------------
                        OTHER STYLES THAT MIGHT BE USEFUL
                    ------------------------------------- */
                    .last {
                      margin-bottom: 0; 
                    }
              
                    .first {
                      margin-top: 0; 
                    }
              
                    .align-center {
                      text-align: center; 
                    }
              
                    .align-right {
                      text-align: right; 
                    }
              
                    .align-left {
                      text-align: left; 
                    }
              
                    .clear {
                      clear: both; 
                    }
              
                    .mt0 {
                      margin-top: 0; 
                    }
              
                    .mb0 {
                      margin-bottom: 0; 
                    }
              
                    .preheader {
                      color: transparent;
                      display: none;
                      height: 0;
                      max-height: 0;
                      max-width: 0;
                      opacity: 0;
                      overflow: hidden;
                      mso-hide: all;
                      visibility: hidden;
                      width: 0; 
                    }
              
                    .powered-by a {
                      text-decoration: none; 
                    }
              
                    hr {
                      border: 0;
                      border-bottom: 1px solid #f6f6f6;
                      margin: 20px 0; 
                    }
              
                    /* -------------------------------------
                        RESPONSIVE AND MOBILE FRIENDLY STYLES
                    ------------------------------------- */
                    @media only screen and (max-width: 620px) {
                      table.body h1 {
                        font-size: 28px !important;
                        margin-bottom: 10px !important; 
                      }
                      table.body p,
                      table.body ul,
                      table.body ol,
                      table.body td,
                      table.body span,
                      table.body a {
                        font-size: 16px !important; 
                      }
                      table.body .wrapper,
                      table.body .article {
                        padding: 10px !important; 
                      }
                      table.body .content {
                        padding: 0 !important; 
                      }
                      table.body .container {
                        padding: 0 !important;
                        width: 100% !important; 
                      }
                      table.body .main {
                        border-left-width: 0 !important;
                        border-radius: 0 !important;
                        border-right-width: 0 !important; 
                      }
                      table.body .btn table {
                        width: 100% !important; 
                      }
                      table.body .btn a {
                        width: 100% !important; 
                      }
                      table.body .img-responsive {
                        height: auto !important;
                        max-width: 100% !important;
                        width: auto !important; 
                      }
                    }
              
                    /* -------------------------------------
                        PRESERVE THESE STYLES IN THE HEAD
                    ------------------------------------- */
                    @media all {
                      .ExternalClass {
                        width: 100%; 
                      }
                      .ExternalClass,
                      .ExternalClass p,
                      .ExternalClass span,
                      .ExternalClass font,
                      .ExternalClass td,
                      .ExternalClass div {
                        line-height: 100%; 
                      }
                      .apple-link a {
                        color: inherit !important;
                        font-family: inherit !important;
                        font-size: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                        text-decoration: none !important; 
                      }
                      #MessageViewBody a {
                        color: inherit;
                        text-decoration: none;
                        font-size: inherit;
                        font-family: inherit;
                        font-weight: inherit;
                        line-height: inherit;
                      }
                      .btn-primary table td:hover {
                        background-color: #34495e !important; 
                      }
                      .btn-primary a:hover {
                        background-color: #34495e !important;
                        border-color: #34495e !important; 
                      } 
                    }
              
                  </style>
                </head>
                <body>
                  <span class="preheader">Bạn đã yêu cầu khôi phục mật khẩu tài khoản của bạn trên hệ thống bán quần áo ThivLevel</span>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
                    <tr>
                      <td>&nbsp;</td>
                      <td class="container">
                        <div class="content">
              
                          <!-- START CENTERED WHITE CONTAINER -->
                          <table role="presentation" class="main">
              
                            <!-- START MAIN CONTENT AREA -->
                            <tr>
                              <td class="wrapper">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td>
                                      <p>Chào bạn,</p>
                                      <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu tài khoản của bạn trên hệ thống bán hàng ThivLevel của chúng tôi. Hãy bấm nút Xác nhận để thực hiện đổi lại mật khẩu.</p>
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                                        <tbody>
                                          <tr>
                                            <td align="left">
                                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                <tbody>
                                                  <tr>
                                                    <td> <a href=${link} target="_blank">Xác nhận</a> </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <p>ThivLevel xin cảm ơn!</p>
                                      <p>Good luck! Hope you like our shop.</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
              
                          <!-- END MAIN CONTENT AREA -->
                          </table>
                          <!-- END CENTERED WHITE CONTAINER -->
              
                          <!-- START FOOTER -->
                          <div class="footer">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td class="content-block">
                                  <span class="apple-link">ThivLevel, Binh Thanh district, Ho Chi Minh city</span>        
                                </td>
                              </tr>
                              <tr>
                                <td class="content-block powered-by">
                                  Powered by ThivLevel.
                                </td>
                              </tr>
                            </table>
                          </div>
                          <!-- END FOOTER -->
              
                        </div>
                      </td>
                      <td>&nbsp;</td>
                    </tr>
                  </table>
                </body>
              </html>`, // html body
      });

      res.json({ msg: 'An email with instructions for resetting your password has been sent to your email' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  resetPassword: async (req, res) => {
    const { id, token } = req.params
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const oldUser = await Users.findOne({ _id: id })
      if (!oldUser) {
        return res.status(400).json({ msg: 'User Not Exists.' })
      }

      const secret = process.env.CHANGE_PASSWORD_SECRET + oldUser.password
      try {
        jwt.verify(token, secret)
        res.json({ msg: 'Verified' })
      } catch (err) {
        res.status(500).json({ msg: err.message })
      }
    } else return res.status(400).json({ msg: 'Invalid Token' })
  },
  updateNewPassword: async (req, res) => {
    // const {id, token} = req.params
    const { id, token, password } = req.body
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const oldUser = await Users.findOne({ _id: id })

      if (!oldUser) {
        return res.status(400).json({ msg: 'User Not Exists.' })
      }
      const secret = process.env.CHANGE_PASSWORD_SECRET + oldUser.password
      try {
        jwt.verify(token, secret)
        if (password.length < 6) 
          return res.status(400).json({ msg: 'Mật khẩu phải có độ dài ít nhất 6 ký tự.' })
        if (password.match(/^(?=.*\s)/))
          return res.status(400).json({ msg: 'Mật khẩu không được chứa khoảng cách' })
        if (!ValidatePassword(password)) 
          return res.status(400).json({ msg: "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa, 1 chữ cái thường và 1 chữ số" })
        const hashPassword = await bcrypt.hash(password, 10)
        await Users.findOneAndUpdate({ _id: id }, {
          password: hashPassword
        })
        res.json({ msg: 'Password Updated' })
      } catch (err) {
        res.status(500).json({ msg: err.message })
      }
    } else return res.status(400).json({ msg: 'Invalid Token' })
  },
  changeStatus: async (req, res) => {
    try {
      const { status } = req.body

      await Users.findOneAndUpdate({ _id: req.params.id }, {
        status
      })

      return res.json({ msg: "User status is changed." })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  addStaff: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!ValidateEmail(email)) return res.status(400).json({ msg: "You have entered an invalid email address!" })
      const user = await Users.findOne({ email })
      if (user) return res.status(400).json({ msg: "The email already exists." })

      if (password.length < 6)
        return res.status(400).json({ msg: 'Mật khẩu phải có độ dài ít nhất 6 ký tự.' })
      if (password.match(/^(?=.*\s)/))
          return res.status(400).json({ msg: 'Mật khẩu không được chứa khoảng cách' })
      if (!ValidatePassword(password)) 
          return res.status(400).json({ msg: "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa, 1 chữ cái thường và một chữ số" })
      //Password Encrypt
      const passwordHash = await bcrypt.hash(password, 10)

      const newUser = new Users({
        username, email, password: passwordHash, role: 1
      })

      //save to database
      await newUser.save()

      return res.json({ msg: "Đã thêm nhân viên mới." })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  verifySmsPhone: async (req, res) => {
    try {
      const { phone } = req.body
      if (phone.length !== 9) return res.status(400).json({ msg: 'Số điện thoại không hợp lệ' })
      const verifySms = await otp.verify.services(twilioConfig.serviceID).verifications.create({
        to: `+84${phone}`,
        channel: 'sms'
      })

      return res.json({ msg: 'Chúng tôi đã gửi mã OTP đến số điện thoại của bạn' })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  verifyCodeSmsCheck: async (req, res) => {
    try {
      const { phone, code } = req.body
      const verificationCheck = await otp.verify.services(twilioConfig.serviceID).verificationChecks.create({
        to: `+84${phone}`,
        code: code
      })

      if (verificationCheck.status !== 'approved') {
        return res.status(400).json({ msg: 'Mã OTP không chính xác!' })
      }

      await Users.findOneAndUpdate({ _id: req.user.id }, {
        isVerifyPhone: true,
      })

      return res.json({ msg: 'Xác thực thành công!' })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }
}

const ValidateEmail = (email) => {
  const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email.match(mailformat)) {
    return true;
  }
  else {
    return false;
  }
}

const ValidatePassword = (password) => {
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  if (password.match(passRegex)) {
    return true;
  }
  else {
    return false;
  }
}

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '11m' })
}

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}
module.exports = userCtrl