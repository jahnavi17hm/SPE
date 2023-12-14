const router = require('express').Router();
const Buyer = require('../models/Buyer');
const Food = require('../models/Food');
const logger = require('../logger/log');

// Middleware to log incoming requests
router.use((req, res, next) => {
    logger.info(`[Request] ${req.method} ${req.originalUrl}`);
    next();
});

router.route('/').get((req, res) => {
    try {
        logger.info("[Success] Fetching all buyers");
        Buyer.find()
            .then(buyers => res.json(buyers))
            .catch(err => {
                logger.error("[Failure] Error fetching all buyers", { error: err.message });
                res.status(200).json('Error: ' + err);
            });
    } catch (error) {
        logger.error("[Error] Error fetching all buyers", { error: error.message });
        res.status(500).json('Error: ' + error);
    }
});

router.route('/register').post((req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const age = req.body.age;
        const contact_number = req.body.contact_number;
        const batch_name = req.body.batch_name;
        const wallet = req.body.wallet || 0;
        const favorites = req.body.favorites || [];
        logger.info(`[Success] Registering a new buyer '${name}'`);
        const newBuyer = new Buyer({
            name,
            email,
            age,
            contact_number,
            batch_name,
            wallet,
            favorites
        });

        newBuyer.save()
            .then(() => {
                logger.info(`[Success] Buyer '${name}' registered successfully`);
                res.json('Buyer registered!');
            })
            .catch(err => {
                logger.error('[Failure] Error registering a new buyer', { error: err.message });
                res.status(200).json('Error: ' + err);
            });
    } catch (error) {
        logger.error("[Error] Error registering a new buyer", { error: error.message });
        res.status(500).json('Error: ' + error);
    }
});

router.route('/:id').get((req, res) => {
    try {
        logger.info("[Success] Fetching buyer by ID");
        Buyer.findById(req.params.id)
            .then(buyer => res.json(buyer))
            .catch(err => {
                logger.error("[Failure] Error fetching buyer by ID", { error: err.message });
                res.status(200).json('Error: ' + err);
            });
    } catch (error) {
        logger.error("[Error] Error fetching buyer by ID", { error: error.message });
        res.status(500).json('Error: ' + error);
    }
});

router.route('/:id').delete((req, res) => {
    try {
        logger.info("[Success] Deleting a buyer by ID");
        Buyer.findByIdAndDelete(req.params.id)
            .then(() => {
                logger.info('[Success] Buyer deleted.');
                res.json('Buyer deleted.');
            })
            .catch(err => {
                logger.error("[Failure] Error deleting a buyer by ID", { error: err.message });
                res.status(200).json('Error: ' + err);
            });
    } catch (error) {
        logger.error("[Error] Error deleting a buyer by ID", { error: error.message });
        res.status(500).json('Error: ' + error);
    }
});

router.route('/update/:id').post((req, res) => {
    try {
        logger.info("[Success] Updating a buyer by ID");
        Buyer.findById(req.params.id)
            .then(buyer => {
                buyer.name = req.body.name;
                buyer.email = req.body.email;
                buyer.age = req.body.age;
                buyer.batch_name = req.body.batch_name;

                buyer.save()
                    .then(() => {
                        logger.info(`[Success] Buyer '${buyer.name}' updated successfully`);
                        res.json('Buyer updated!');
                    })
                    .catch(err => {
                        logger.error("[Failure] Error updating a buyer by ID", { error: err.message });
                        res.status(200).json('Error: ' + err);
                    });
            })
            .catch(err => {
                logger.error("[Failure] Error updating a buyer by ID", { error: err.message });
                res.status(200).json('Error: ' + err);
            });
    } catch (error) {
        logger.error("[Error] Error updating a buyer by ID", { error: error.message });
        res.status(500).json('Error: ' + error);
    }
});

router.route('/favorite/:id').post((req, res) => {
    try {
        let usertoken = req.usertoken;
        logger.info("[Success] Updating buyer's favorites");
        Buyer.findOne({ email: usertoken.email })
            .then(buyer => {
                Food.findById(req.params.id)
                    .then(food => {
                        let index = buyer.favorites.indexOf(req.params.id);
                        if (index > -1) {
                            buyer.favorites.splice(index, 1);
                        } else {
                            buyer.favorites.push(req.params.id);
                        }
                        buyer.save()
                            .then(() => {
                                logger.info(`[Success] Buyer '${buyer.name}' favorites updated successfully`);
                                res.status(200).json({ status: 0 });
                            })
                            .catch((err) => res.json({ status: 1, error: err }));
                    })
                    .catch(err => {
                        logger.error("[Failure] Error updating buyer's favorites", { error: err.message });
                        res.status(200).json({
                            status: 1,
                            error: err
                        });
                    });
            })
            .catch(err => {
                logger.error("[Failure] Error updating buyer's favorites", { error: err.message });
                res.status(200).json({
                    status: 1,
                    error: err
                });
            });
    } catch (error) {
        logger.error("[Error] Error updating buyer's favorites", { error: error.message });
        res.status(500).json({
            status: 1,
            error: error
        });
    }
});

module.exports = router;
