const mongoose=require('mongoose');
const userSchema= new mongoose.Schema({
    username:{
        type:String,
        require:true,
        trim:true,
        lowercase:true,
        unique:true,
        minlength:[4,'username must be at least 4 character']
    },
    email:{
        type:String,
        require:true,
        trim:true,
        lowercase:true,
        unique:true,
         minlength:[13,'Email must be at least 13 character']
    },
    password:{
        type:String,
        require:true,
        trim:true,
        minlength:[5,'Password must be at least 5 character']
    }
})

const  user=mongoose.model('user',userSchema)
module.exports=user;