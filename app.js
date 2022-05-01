const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path=require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const passport=require('passport');

const STRIPE_PUBLISHABLE_KEY="pk_test_51KozwRBZ6TPsAxmf3NEzojEcB9bHg40g81hDPVgvzHPFCOWvZyFA7v43nyJT1BCp9bl2rGZa2et2rh4lgd8qmyYa00lFvnSt1L";
const STRIPE_SECRET_KEY="sk_test_51KozwRBZ6TPsAxmfSj0JkEjcY505GIutbhYaLIe3yWKgRlAFs7r5BIJ8b3t0SnIdr0PxdYLx6ohDbiVswKoF5Y4w00CTVtLKZt";

const stripe = require('stripe')(STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
  appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/accept-a-payment/payment-element",
    version: "0.0.2",
    url: "https://github.com/stripe-samples"
  }
});


require('./config/passport')(passport);

const port = process.env.PORT || 3000;

//handle bar middleware
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//method override middleware
app.use(methodOverride('_method'))

//Flash message middleware
app.use(session({
    secret: 'Secret',
    resave: true,
    saveUninitialized: true,
  }));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Set Global Variable
app.use(function(req,res,next){
  res.locals.sucess_msg=req.flash('sucess_msg');
  res.locals.error_msg=req.flash('error_msg');
  res.locals.error=req.flash('error');
  res.locals.user=req.user||null
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Set Static Path
app.use(express.static(path.join(__dirname,'public')));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

//imports Routes
app.get('/config', (req, res) => {
  res.send({
    publishableKey: STRIPE_PUBLISHABLE_KEY,
  });
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
app.post('/webhook', async (req, res) => {
  let data, eventType;

  // Check if webhook signing is configured.
  if (STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'payment_intent.succeeded') {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log('💰 Payment captured!');
  } else if (eventType === 'payment_intent.payment_failed') {
    console.log('❌ Payment failed.');
  }
  res.sendStatus(200);
});

app.use(require('./routes/page'));
app.use(require('./routes/idea'));
app.use(require('./routes/user'));
app.use(require('./routes/credit'));

//Not found Page
// app.use(function(req, res) {
//     return res.status(404).send({ success: false, msg: 'Page not found' })
//   });

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});