const mongoose=require('mongoose');


const fileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: [true, 'Path is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original Name is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: [true, 'user is required'],
  },},
  {
    timestamps:true
});


const file=mongoose.model('file',fileSchema)

module.exports=file;