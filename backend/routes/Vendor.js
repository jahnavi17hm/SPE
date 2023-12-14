const router = require('express').Router();
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const logger = require('../logger/log');

// Fetch all vendors
router.route('/').get(async (req, res) => {
    try {
        logger.info("Fetching all vendors");
        const vendors = await Vendor.find();
        res.json(vendors);
    } catch (error) {
        logger.error("Error fetching vendors", { error: error.message });
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Register a new vendor
router.route('/register').post(async (req, res) => {
    try {
        const { name, shop_name, email, contact_number, canteen_timings } = req.body;
        logger.info(`New vendor ${name} is added`);

        const order_stats = [0, 0];
        const newVendor = new Vendor({ name, shop_name, email, contact_number, canteen_timings, order_stats });

        await newVendor.save();
        logger.info(`Vendor ${name} added successfully`);

        res.json({ status: 0, message: `Vendor ${name} added successfully` });
    } catch (error) {
        logger.error("Error adding a new vendor", { error: error.message });
        res.status(500).json({ status: 1, error: "Internal Server Error" });
    }
});

// Fetch vendor by ID
router.route('/:id').get(async (req, res) => {
    try {
        logger.info("Fetching vendor by ID");

        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            logger.error("Vendor not found");
            return res.status(404).json({ status: 1, error: "Vendor not found" });
        }

        res.json({ status: 0, vendor });
    } catch (error) {
        logger.error("Error fetching vendor by ID", { error: error.message });
        res.status(500).json({ status: 1, error: error.message });
    }
});

// Fetch pending orders for a vendor
router.route('/pending/:id').get(async (req, res) => {
    try {
        logger.info("Fetching pending orders for a vendor");

        const doc = await Order.aggregate([
            { $match: { $and: [{ canteen: new mongoose.Types.ObjectId(req.params.id) }, { $and: [{ status: { $gte: 1 } }, { status: { $lte: 3 } }] }] } }
        ]);

        res.status(200).json({ status: 0, pending: doc.length });
    } catch (error) {
        logger.error("Error fetching pending orders for a vendor", { error: error.message });
        res.status(500).json({ status: 1, error: error.message });
    }
});

// Fetch batchwise orders for a vendor
router.route("/batchwise/:id").get(async (req, res) => {
    try {
        logger.info("Fetching batchwise orders for a vendor");

        const myMap = new Map();
        let doc = await Order.find({ "canteen": req.params.id, "status": 4 });
        for (let i in doc) {
            let a = doc[i];
            let b = await Buyer.findById(a.buyer);
            if (!myMap.has(b.batch_name)) myMap.set(b.batch_name, 0);
            myMap.set(b.batch_name, myMap.get(b.batch_name) + 1);
        }

        let orders = Array.from(myMap);
        orders.sort();

        let labels = [];
        let count = [];

        for (let i in orders) {
            labels.push(orders[i][0]);
            count.push(orders[i][1]);
        }

        res.status(200).json({ status: 0, labels, count });
    } catch (error) {
        logger.error("Error fetching batchwise orders for a vendor", { error: error.message });
        res.status(500).json({ status: 1, error: error.message });
    }
});

// Fetch agewise orders for a vendor
router.route("/agewise/:id").get(async (req, res) => {
    try {
        logger.info("Fetching agewise orders for a vendor");

        const myMap = new Map();
        let doc = await Order.find({ "canteen": req.params.id, "status": 4 });
        for (let i in doc) {
            let a = doc[i];
            let b = await Buyer.findById(a.buyer);
            if (!myMap.has(b.age)) myMap.set(b.age, 0);
            myMap.set(b.age, myMap.get(b.age) + 1);
        }

        let orders = Array.from(myMap);
        orders.sort();

        let labels = [];
        let count = [];

        for (let i in orders) {
            labels.push(orders[i][0]);
            count.push(orders[i][1]);
        }

        res.status(200).json({ status: 0, labels, count });
    } catch (error) {
        logger.error("Error fetching agewise orders for a vendor", { error: error.message });
        res.status(500).json({ status: 1, error: error.message });
    }
});

// Delete a vendor
router.route('/:id').delete(async (req, res) => {
    try {
        logger.info("Deleting a vendor");

        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            logger.error("Vendor not found");
            return res.status(404).json({ status: 1, error: "Vendor not found" });
        }

        await Vendor.findByIdAndDelete(req.params.id);

        logger.info("Vendor deleted successfully");
        res.json({ status: 0, message: 'Vendor deleted successfully' });
    } catch (error) {
        logger.error("Error deleting a vendor", { error: error.message });
        res.status(500).json({ status: 1, error: error.message });
    }
});

// Update a vendor
router.route('/update/:id').post(async (req, res) => {
    try {
        logger.info("Updating a vendor");

        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            logger.error("Vendor not found");
            return res.status(404).json({ status: 1, error: "Vendor not found" });
        }

        vendor.name = req.body.name;
        vendor.shop_name = req.body.shop_name;
        vendor.email = req.body.email;
        vendor.contact_number = req.body.contact_number;
        vendor.canteen_timings = req.body.canteen_timings;

        await vendor.save();
        logger.info(`Vendor ${vendor.name} updated successfully`);

        res.json({ status: 0, message: `Vendor ${vendor.name} updated successfully` });
    } catch (error) {
        logger.error("Error updating a vendor", { error: error.message });
        res.status(500).json({ status: 1, error: error.message });
    }
});

module.exports = router;
