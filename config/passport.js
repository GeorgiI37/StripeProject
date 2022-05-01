const LocalStrategy=require('passport-local').Strategy;
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';
opts.issuer = 'accounts.examplesoft.com';
opts.audience = 'yoursite.net';

const { User } = require('../models/user');

module.exports=function(passport){
passport.use(new LocalStrategy({usernameField:'email'},(email,password,done)=>{
     User.findOne({email:email}).then((user)=>{
         if(!user){
             return done(null,false,'User Not Found');
         }
         bcrypt.compare(password,user.password,(err,isMatch)=>{
             if(err) throw err;
            if(isMatch){
                return done(null,user);
            }else{
               return done(null,false,{message:'Password Incorrect'})
            }
        });

     })
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  User.findOne({id: jwt_payload.sub}, function(err, user) {
      if (err) {
          return done(err, false);
      }
      if (user) {
          return done(null, user);
      } else {
          return done(null, false);
          // or you could create a new account
      }
  });
}));