const router = require('express').Router();
const Buyer = require('../models/Buyer');
const Food = require('../models/Food');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const logger = require('../logger/log');

// Middleware to log incoming requests
router.use((req, res, next) => {
    logger.info(`[Request] ${req.method} ${req.originalUrl}`);
    next();
});

router.route('/').get((req, res) => {
    try {
        logger.info("[Success] Fetching all food items");
        Food.find()
            .then(food => res.json({
                status: 0,
                food: food
            }))
            .catch(err => {
                logger.error("[Failure] Error fetching all food items", { error: err.message });
                res.status(200).json({
                    status: 1,
                    error: err
                });
            });
    } catch (error) {
        logger.error("[Error] Error fetching all food items", { error: error.message });
        res.status(500).json({
            status: 1,
            error: error
        });
    }
});

router.route('/register').post(async (req, res) => {
    try {
        const item_name = req.body.item_name;
        const canteen = req.body.canteen;
        const price = req.body.price;
        const non_veg = req.body.non_veg;
        const toppings = req.body.toppings || [];
        const tags = req.body.tags || [];
        logger.info("[Success] Registering a new food item");

        const existingFood = await Food.findOne({ canteen: canteen, item_name: item_name });
        if (existingFood) {
            logger.error("[Failure] Food item with the same name already exists");
            return res.status(200).json({
                status: 1,
                error: "You already have a food item of the same name"
            });
        }

        const newFood = new Food({
            item_name,
            canteen,
            price,
            non_veg,
            toppings,
            tags,
        });

        newFood.save()
            .then(() => {
                logger.info(`[Success] New food item '${item_name}' registered for canteen '${canteen}'`);
                res.json({
                    status: 0,
                    message: `Food item '${item_name}' added successfully`
                });
            })
            .catch(err => {
                logger.error('[Failure] Error registering a new food item', { error: err.message });
                res.status(200).json({
                    status: 1,
                    error: err
                });
            });
    } catch (error) {
        logger.error("[Error] Error registering a new food item", { error: error.message });
        res.status(500).json({
            status: 1,
            error: error
        });
    }
});

router.route('/:id').get((req, res) => {
    try {
        logger.info("[Success] Fetching food item by ID");
        Food.findById(req.params.id)
            .then(food => res.json(food))
            .catch(err => {
                logger.error("[Failure] Error fetching food item by ID", { error: err.message });
                res.status(200).json('Error: ' + err);
            });
    } catch (error) {
        logger.error("[Error] Error fetching food item by ID", { error: error.message });
        res.status(500).json('Error: ' + error);
    }
});

router.route('/rate/:id').get(async (req, res) => {
    try {
        logger.info("[Success] Fetching rating for a food item by ID");
        const foodId = req.params.id;
        const docs = await Order.aggregate([
            { $match: { $and: [{ food: new mongoose.Types.ObjectId(foodId) }, { rating: { $gte: 1 } }] } },
            { $group: { _id: null, sum: { $sum: "$rating" }, count: { $sum: 1 } } }
        ]);
        const rating = docs.length !== 0 && docs[0]["count"] !== 0 ? docs[0]["sum"] / docs[0]["count"] : 0;
        return res.status(200).json(rating);
    } catch (error) {
        logger.error("[Failure] Error fetching rating for a food item by ID", { error: error.message });
        res.status(500).json({ status: 1, error: error });
    }
});

router.route('/:id').delete(async (req, res) => {
    try {
        logger.info("[Success] Deleting a food item by ID");
        const foodId = req.params.id;
        await Food.findByIdAndDelete(foodId);

        const buyers = await Buyer.find();
        buyers.forEach(async (buyer) => {
            const index = buyer.favorites.indexOf(foodId);
            if (index > -1) {
                buyer.favorites.splice(index, 1);
                await buyer.save();
            }
        });

        await Order.deleteMany({ food: new mongoose.Types.ObjectId(foodId) });

        logger.info(`[Success] Food item with ID '${foodId}' deleted.`);
        res.json({
            status: 0,
            message: "Food item deleted successfully"
        });
    } catch (error) {
        logger.error("[Error] Error deleting a food item by ID", { error: error.message });
        res.status(500).json({
            status: 1,
            error: error
        });
    }
});

router.route('/canteen/:canteen').get(async (req, res) => {
    try {
        logger.info("[Success] Fetching food items by canteen");
        const foods = await Food.find({ "canteen": req.params.canteen });
        foods.sort((a, b) => b.times_sold - a.times_sold);
        return res.status(200).json({ status: 0, food: foods });
    } catch (error) {
        logger.error("[Failure] Error fetching food items by canteen", { error: error.message });
        res.status(500).json({ status: 1, error: error });
    }
});

router.route('/update/:id').post((req, res) => {
    try {
        logger.info("[Success] Updating a food item by ID");
        const foodId = req.params.id;
        Food.findById(foodId)
            .then(food => {
                food.item_name = req.body.item_name || food.item_name;
                food.price = req.body.price || food.price;
                food.non_veg = req.body.non_veg || food.non_veg;
                food.toppings = req.body.toppings || food.toppings;
                food.tags = req.body.tags || food.tags;

                food.save()
                    .then(() => res.json({
                        status: 0,
                        message: "Food item updated successfully"
                    }))
                    .catch(err => {
                        logger.error("[Failure] Error updating a food item by ID", { error: err.message });
                        res.status(200).json({
                            status: 1,
                            error: err
                        });
                    });
            })
            .catch(err => {
                logger.error("[Failure] Error updating a food item by ID", { error: err.message });
                res.status(200).json({
                    status: 1,
                    error: err
                });
            });
    } catch (error) {
        logger.error("[Error] Error updating a food item by ID", { error: error.message });
        res.status(500).json({
            status: 1,
            error: error
        });
    }
});

module.exports = router;
