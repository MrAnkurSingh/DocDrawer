const express=require('express');
const userRouter=require('./routes/user.route')
const dotenv=require('dotenv');
dotenv.config();
const connectToDB=require('./config/db')
connectToDB();
const cookieParser=require('cookie-parser')
const indexRouter=require('./routes/index.routes');
const upload = require('./config/multer');
const supabase = require('./config/supabase');


const app=express();


app.set('view engine','ejs')
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use('/',indexRouter)
app.use('/user',userRouter);



app.listen(3000,()=>{
    console.log("Server is runnig on port 3000")
});

