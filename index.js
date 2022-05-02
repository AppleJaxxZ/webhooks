const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECERET);
require('dotenv').config()
const User = require('./models/user')
const Subscription = require('./models/subscription')
const port = process.env.PORT || 5500;
const Test = require('./models/testing')


mongoose
    .connect(process.env.DATABASE)
    .then(() => console.log('DB connected'))
    .catch((err) => console.log('DB Error => ', err));


app.use(cors());
app.options("*", cors({ origin: true }));

app.post('/test', express.json(), express.urlencoded({ extended: true }), async (request, response) => {
    const data = request.body
    console.log(data)
    const person = new Test(data)
    await person.save();

    response.json(data)
})

app.post('/webhook', express.raw({ type: "*/*" }), async (request, response) => {
    const endpointSecret = process.env.STRIPE_WEBSECRET;
    const stripePayload = request.body;
    console.log('THIS IS PAYLOAD', stripePayload);
    const sig = request.headers['stripe-signature'];
    console.log('THIS IS THE SIG', sig);

    let event;

    try {
        event = stripe.webhooks.constructEvent(stripePayload, sig, endpointSecret);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'subscription_schedule.updated':
            const subId = event.data.object.subscription;
            const subObject = event.data.object;

            // // Then define and call a function to handle the event payment_intent.succeeded


            const customer = await Subscription.findOneAndUpdate(
                { stripe_id: subId },
                subObject,
                { new: true }
            );
            console.log('FOUND CUSTOMER SUB', customer);
            break;

        case 'customer.subscription.updated':
            const subScriptId = event.data.object.id;

            const subObj = event.data.object;

            const customerSub = await Subscription.findOneAndUpdate(
                { stripe_id: subScriptId },
                subObj,
                { new: true }
            );



            break;
        case 'customer.updated':
            const customerId = event.data.object.id;
            const customerObject = event.data.object;
            console.log("CUSTOMER'S ID FROM WEBHOOK", customerObject);

            const findCustomer = await User.findOne({ stripe_customer_id: customerId })
            console.log(findCustomer)
            const customerUpdate = await User.findOneAndUpdate(
                { stripe_customer_id: customerId },
                { name: customerObject.name, email: customerObject.email, phoneNumber: customerObject.phone, pinNumber: customerObject.metadata.pinNumber, dateOfBirth: customerObject.metadata.dateOfBirth },


            );



            break;

        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send('Success!');
})

app.listen(port, () => console.log(`Server is running on port ${port}`));