process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js');
const Buyer = require('../models/Buyer'); // Adjust the path accordingly

chai.use(chaiHttp);
const expect = chai.expect;
const agent = chai.request.agent(app); // Updated to use chai.request.agent

describe('Buyer API Tests', () => {
    beforeEach(async () => {
        // You may want to clear the database or perform other setup tasks
        // before each test case
        await Buyer.deleteMany({});
    });

    it('Fetch all buyers - Success', async () => {
        try {
            const res = await agent.get('/api/buyer');

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object'); // Adjust this based on your response structure
            // Add more assertions based on your test scenario

        } catch (error) {
            console.error('Error during test:', error);
            throw error;
        }
    });

    it('Register a new buyer - Success', async () => {
        const buyerData = {
            name: 'John Doe',
            email: 'john@example.com',
            age: 25,
            contact_number: '1234567890',
            batch_name: 'UG 1',
            wallet: 100,
            favorites: []
        };

        try {
            const res = await agent.post('/api/buyer/register').send(buyerData);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object'); // Adjust this based on your response structure
            // Add more assertions based on your test scenario

        } catch (error) {
            console.error('Error during test:', error);
            throw error;
        }
    });

    // Update this test based on your Buyer model and its requirements
    it('Fetch buyer by ID - Success', async () => {
        // Assume you have a buyer in the database
        const existingBuyer = new Buyer({
            name: 'Existing Buyer',
            email: 'existing@example.com',
            age: 30,
            contact_number: '9876543210',
            batch_name: 'Batch B',
            wallet: 50,
            favorites: [],
            password: 'password123' // Provide a password here based on your model requirements
        });

        await existingBuyer.save();
        try {
            const res = await agent.get(`/api/buyer/${existingBuyer._id}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object'); // Adjust this based on your response structure
            // Add more assertions based on your test scenario

        } catch (error) {
            console.error('Error during test:', error);
            throw error;
        }
    });

    // Add more test cases as needed for other buyer-related routes

    after(async () => {
        // You may want to perform cleanup tasks after all test cases are run
        await agent.close(); // Close the agent to release resources
    });
});
