const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authorize = require("./middleware/tokenAuth");
const bodyParser = require('body-parser');
const corsOptions = {
    origin:'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200
}

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
require("dotenv").config();
const port = process.env.PORT || 5000
const dbConnection = require('./db')

app.use(cors({
    origin: '*',
    methods: '*',   
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin: *');
    res.header('Access-Control-Allow-Methods: *');
    res.header('Access-Control-Allow-Headers: *');
    next();
});

const uri = process.env.ATLAS_URI;

mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const buyerRouter = require('./routes/Buyer');
const vendorRouter = require('./routes/Vendor');
const foodRouter = require('./routes/Food');
const authRouter = require('./routes/Authenticate');
const userRouter = require('./routes/User');
const orderRouter = require('./routes/Order');
app.use('/auth', authRouter);
app.use(authorize);
app.use('/vendor', vendorRouter);
app.use('/food', foodRouter);
app.use('/orders', orderRouter);
app.use('/buyer', buyerRouter);
app.use('/user', userRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});


