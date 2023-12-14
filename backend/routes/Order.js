const router = require('express').Router();
const Order = require('../models/Order');
const Food = require('../models/Food');
const mongoose = require("mongoose");
const Vendor = require('../models/Vendor');
const nodemailer = require('nodemailer');
const logger = require('../logger/log');
require('dotenv').config();

router.route('/').get((req, res) => {
    try {
        logger.info("Fetching all orders");
        Order.find()
            .then(order => res.json(order))
            .catch(err => {
                logger.error("Error fetching all orders", { error: err.message });
                res.status(500).json('Error: ' + err);
            });
    } catch (error) {
        logger.error("Error fetching all orders", { error: error.message });
        res.status(500).json('Error: ' + error);
    }
});

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

var mailOptions = (name, action, canteen) => {
    return {
        from: process.env.EMAIL,
        to: process.env.RECIPIENT,
        subject: `${name} from ${canteen} canteen has ${action} your order`,
        text: 'This mail was automatically generated'
    };
};

var sendMail = (name, action, canteen) => {
    transporter.sendMail(mailOptions(name, action, canteen), function (error, info) {
        if (error) {
            logger.error("Error sending email notification", { error: error.message });
            console.log(error);
        } else {
            logger.info(`${name} has been notified`);
            console.log(info);
        }
    });
};

router.route('/register').post(async (req, res) => {
    try {
        const placed_time = req.body.placed_time;
        const buyer = req.body.buyer;
        const food = req.body.food;
        const a = await Food.findById(food);
        const canteen = a.canteen;
        const quantity = req.body.quantity;
        const status = 0;
        const cost = req.body.cost;
        const rating = req.body.rating || 0;
        const toppings = req.body.toppings || [];
        logger.info("Registering a new order");

        const newOrder = new Order({
            placed_time,
            buyer,
            food,
            canteen,
            quantity,
            status,
            cost,
            rating,
            toppings
        });

        const b = await Vendor.findById(canteen);
        b.order_stats.placed++;
        b.save();

        newOrder.save()
            .then(() => {
                logger.info(`New order registered for buyer ${buyer}`);
                res.json({ status: 0, message: `Order registered for buyer ${buyer}` });
            })
            .catch(err => {
                logger.error(`Error registering a new order for buyer ${buyer}`, { error: err.message });
                res.status(200).json({ status: 1, error: err });
            });
    } catch (error) {
        logger.error("Error registering a new order", { error: error.message });
        res.status(500).json({ status: 1, error: error });
    }
});

router.route('/:id').get((req, res) => {
    try {
        logger.info("Fetching order by ID");
        Order.findById(req.params.id)
            .then(order => res.json(order))
            .catch(err => {
                logger.error("Error fetching order by ID", { error: err.message });
                res.status(200).json('Error: ' + err);
            });
    } catch (error) {
        logger.error("Error fetching order by ID", { error: error.message });
        res.status(500).json('Error: ' + error);
    }
});

router.route('/:id').delete((req, res) => {
    try {
        logger.info("Deleting an order by ID");
        Order.findByIdAndDelete(req.params.id)
            .then(() => {
                logger.info('Order deleted.');
                res.json('Order deleted.');
            })
            .catch(err => {
                logger.error("Error deleting an order by ID", { error: err.message });
                res.status(200).json('Error: ' + err);
            });
    } catch (error) {
        logger.error("Error deleting an order by ID", { error: error.message });
        res.status(500).json('Error: ' + error);
    }
});

router.route('/canteen/:canteen').get((req, res) => {
    try {
        logger.info("Fetching orders by canteen");
        Order.find({ "canteen": req.params.canteen })
            .then(food => res.json(food))
            .catch(err => {
                logger.error("Error fetching orders by canteen", { error: err.message });
                res.status(200).json('Error: ' + err);
            });
    } catch (error) {
        logger.error("Error fetching orders by canteen", { error: error.message });
        res.status(500).json('Error: ' + error);
    }
});

router.route('/reject/:id').get(async (req, res) => {
    try {
        logger.info("Rejecting an order by ID");
        Order.findById(req.params.id)
            .then(async order => {
                if (order.status == 5) {
                    res.status(200).json({ status: 1, error: 'Order already rejected' });
                } else if (order.status != 0) {
                    res.status(200).json({ status: 1, error: 'Order has already been accepted' });
                } else {
                    order.status = 5;
                    let b = await Buyer.findById(order.buyer);
                    b.wallet += order.cost;
                    b.save();
                    let v = await Vendor.findById(order.canteen);
                    sendMail(v.name, "rejected", v.shop_name);
                    order.save()
                        .then(() => {
                            logger.info('Order Rejected');
                            res.json({ status: 0, message: 'Order Rejected' });
                        })
                        .catch((err) => {
                            logger.error("Error rejecting an order by ID", { error: err.message });
                            res.status(200).json({ status: 1, error: err });
                        });
                }
            })
            .catch((err) => {
                logger.error("Error rejecting an order by ID", { error: err.message });
                res.status(200).json({ status: 1, error: err });
            });
    } catch (error) {
        logger.error("Error rejecting an order by ID", { error: error.message });
        res.status(500).json({ status: 1, error: error });
    }
});

router.route("/buyer/:id").get(async (req, res) => {
    try {
        logger.info("Fetching orders by buyer ID");
        Order.find({ buyer: req.params.id })
            .then((orders) => {
                return res.status(200).json({
                    status: 0,
                    orders: orders
                });
            })
            .catch((err) => {
                logger.error("Error fetching orders by buyer ID", { error: err.message });
                return res.status(200).json({
                    status: 1,
                    error: err
                });
            });
    } catch (error) {
        logger.error("Error fetching orders by buyer ID", { error: error.message });
        res.status(500).json({ status: 1, error: error });
    }
});

router.route("/vendor/:id").get(async (req, res) => {
    try {
        logger.info("Fetching orders by vendor ID");
        Order.find({ vendor: req.params.id })
            .then((orders) => {
                return res.status(200).json({
                    status: 0,
                    orders: orders
                });
            })
            .catch((err) => {
                logger.error("Error fetching orders by vendor ID", { error: err.message });
                return res.status(200).json({
                    status: 1,
                    error: err
                });
            });
    } catch (error) {
        logger.error("Error fetching orders by vendor ID", { error: error.message });
        res.status(500).json({ status: 1, error: error });
    }
});

router.route('/update/rating/:id').post(async (req, res) => {
    try {
        logger.info("Updating order rating by ID");
        let order = await Order.findById(req.params.id);
        order.rating = req.body.rating;
        order.save()
            .then(() => {
                logger.info('Order rating updated');
                res.status(200).json({ status: 0 });
            })
            .catch((err) => {
                logger.error("Error updating order rating by ID", { error: err.message });
                res.status(200).json({ status: 1, error: err });
            });
    } catch (error) {
        logger.error("Error updating order rating by ID", { error: error.message });
        res.status(500).json({ status: 1, error: error });
    }
});

router.route('/update/:id').get(async (req, res) => {
    try {
        logger.info("Updating order status by ID");
        let order = await Order.findById(req.params.id);
        const vendor = await Vendor.findById(order.canteen);
        if (order.status == 5) {
            res.status(200).json({
                status: 1,
                error: 'Order already rejected'
            });
        } else if (order.status == 4) {
            res.status(200).json({
                status: 1,
                error: 'Order already completed'
            });
        } else {
            let docs = await Order.aggregate([
                { $match: { $and: [{ canteen: new mongoose.Types.ObjectId(order.canteen) }, { status: { $eq: 1 } }] } }
            ]);
            let docs2 = await Order.aggregate([
                { $match: { $and: [{ canteen: new mongoose.Types.ObjectId(order.canteen) }, { status: { $eq: 2 } }] } }
            ]);
            let x = docs.length + docs2.length;
            if (order.status === 0 && x === 10) {
                return res.status(200).json({
                    status: 1,
                    error: "Please finish cooking the other orders"
                });
            }
            if (order.status === 3 && req.usertoken.type === "vendor") {
                return res.status(200).json({
                    status: 1,
                    error: "Please wait for the buyer to pick up"
                });
            }
            order.status = order.status + 1;
            switch (order.status) {
                case 1:
                    res.status(200).json({
                        status: 0,
                        message: 'Order accepted!'
                    });
                    break;
                case 2:
                    res.status(200).json({
                        status: 0,
                        message: 'Order is now being cooked!'
                    });
                    break;
                case 3:
                    res.status(200).json({
                        status: 0,
                        message: 'Order is ready for pickup!'
                    });
                    break;
                case 4:
                    res.status(200).json({
                        status: 0,
                        message: 'Order is completed!'
                    });
                    break;
            }
        }
        order.save();
        if (order.status === 1) {
            const food = await Food.findById(order.food);
            food.times_sold += order.quantity;
            sendMail(vendor.name, "accepted", vendor.shop_name);
            food.save();
            vendor.save();
        } else if (order.status == 4) {
            vendor.order_stats.completed++;
            vendor.save();
        }
        logger.info('Order status updated');
    } catch (error) {
        logger.error("Error updating order status by ID", { error: error.message });
        res.status(500).json({ status: 1, error: error });
    }
});

module.exports = router;
