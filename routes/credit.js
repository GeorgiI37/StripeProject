const express = require('express');
const router = express.Router();
const StripeHandler = require('../controllers/StripeHandler')

//import databse models
const { User } = require('../models/user');

//redirect pay page
router.get('/credits/pay',(req,res)=>{
    res.render('credits/pay');
});

router.get('/credits/return',(req,res)=>{

    User.findOne({ email: req.user.email }).then((user) => {
        if (!user) {
           req.flash('error_msg','Email Doesn\'t Exists');
           res.redirect('/users/login');
        } else {
            user.credited = true;
            user.save().then((result) => {
                req.flash('sucess_msg', 'Paid Sucessfully');
                res.render('credits/return');
            }).catch((err) => {
                res.send(err);
            });
        }
    });
});

//operate credit action
router.get('/create-payment-intent', StripeHandler.paynow);
router.post('/credits/checkout', StripeHandler.checkout);
router.post('/credits/create-Customer', StripeHandler.createNewCustomer);
router.post('/credits/add-Card', StripeHandler.addNewCard);
router.post('/credits/create-Charges', StripeHandler.createCharges);

module.exports=router;