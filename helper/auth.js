module.exports={
    ensureAuthenticated:function(req,res,next){
        if(req.isAuthenticated()){
            if (!req.user.credited)
            {
                req.flash('error_msg','Not Credited user. Please Pay for 19.99$.')
                res.redirect('/credits/pay')
            }
            else
                return next();
        }
        else
        {
            req.flash('error_msg','Not Authorized user')
            res.redirect('/users/login')
        }
    }
}