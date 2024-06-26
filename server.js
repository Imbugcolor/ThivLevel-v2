require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const path = require('path')
const SocketServer = require('./socket.server')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(fileUpload({
    useTempFiles: true
}))

//Socket
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
})

global._io = io;

io.on('connection', socket => {
    SocketServer(socket)
})

//Routes
app.use('/user', require('./routes/userRouter'))
app.use('/api', require('./routes/categoryRouter'))
app.use('/api', require('./routes/upload'))
app.use('/api', require('./routes/productsRouter'))
app.use('/api', require('./routes/paymentRouter'))
app.use('/api', require('./routes/stripeRouter'))
app.use('/api', require('./routes/paypalRouter'))


//Connect to mongoDB
const URI = process.env.MONGODB_URL
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw err;
    console.log('Connected to MongoDB')
})

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}

app.get('/', (req, res) => {
    res.json({ msg: 'Welcome my channel, please subsribe for us. Thanks' })
})

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})