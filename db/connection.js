const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
require('dotenv').config();
mongoose.connect("mongodb://localhost:27017/venus",{ useMongoClient: true }).then(()=>{
    console.log('Database connected')
}).catch((err)=>{
    console.log(err);
});
module.exports={mongoose}