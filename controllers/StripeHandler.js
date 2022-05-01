const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
    appInfo: { // For sample support and debugging, not required for production:
      name: "stripe-samples/accept-a-payment/payment-element",
      version: "0.0.2",
      url: "https://github.com/stripe-samples"
    }
  });

exports.paynow = async (req, res) => {
    // Create a PaymentIntent with the amount, currency, and a payment method type.
    //
    // See the documentation [0] for the full list of supported parameters.
    //
    // [0] https://stripe.com/docs/api/payment_intents/create
    try {
        const paymentIntent = await stripe.paymentIntents.create({
        currency: 'EUR',
        amount: 1999,
        automatic_payment_methods: { enabled: true }
        });

        // Send publishable key and PaymentIntent details to client
        res.send({
        clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        return res.status(400).send({
        error: {
            message: e.message,
        },
        });
    }
}

exports.checkout = async(req, res, next) => {
    try
    {
        // const session = await stripe.checkout.sessions.create({
        //     customer: req.body.email,
        //     payment_method_types: ["cards"],
        //     mode: "payment",
        //     line_items: [{
        //         price: 100,
        //         quantity: req.body.quantity
        //     }],
        //     success_url: '/about',
        //     cancel_url: '/credits/pay'
        // })
        // res.send({id: session.id});
        // // res.redirect(303, session.url);

        // Set your secret key. Remember to switch to your live secret key in production.
        // See your keys here: https://dashboard.stripe.com/apikeys

        // Token is created using Stripe Checkout or Elements!
        // Get the payment token ID submitted by the form:
        const token = req.body.stripeToken; // Using Express

        const charge = await stripe.charges.create({
            amount: 999,
            currency: 'usd',
            description: 'Example charge',
            source: token,
        });
    }
    catch (e) {
        throw new Error(e);
    }
}

exports.createNewCustomer = async(req, res, next) => {
    try {
        const customer = await stripe.customers.create({
            name: req.body.name,
            email: req.body.email
        });
    }
    catch (e) {
        throw new Error(e);
    }
}

exports.addNewCard = async(req, res, next) => {
    const {
        customer_Id,
        card_Name,
        card_ExpYear,
        card_ExpMonth,
        card_Number,
        card_CVC
    } = req.body;
    try {
        const card_Token = await stripe.tokens.create({
            card: {
                name: card_Name,
                number: card_Number,
                exp_month: card_ExpMonth,
                exp_year: card_ExpYear,
                cvc: card_CVC
            }
        });
        const card = await stripe.customers.createSource(customer_Id, {
            source: '$(card_Token.id)',
        });
        return res.status(200).send({card: card.id});
    }
    catch (e) {
        throw new Error(e);
    }
}

exports.createCharges = async(req, res, next) => {
    try {
        stripe.charges.create({
            amount: req.body.amount * 100,
            source: 'tok_mex',
            currency: "usd"
        })
        .then(() => {
            console.log('Charge Successful')
            res.json({ message: 'Successfully purchased items' })
        })
        .catch(err => console.log(err));
    }
    catch (e) {
        throw new Error(e);
    }
}

