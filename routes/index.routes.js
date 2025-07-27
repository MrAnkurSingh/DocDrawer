const express = require('express');
const verifyJWT = require('../middlewares/verifyJWT');

const router = express.Router();
const supabase = require('../config/supabase');
const upload = require('../config/multer');
const fileModel = require('../models/files.models');



router.get('/', (req, res) => {
  res.redirect('/user/register'); 
});


router.get('/home', verifyJWT, async (req, res, next) => {
  const userfiles = await fileModel.find({
    user: req.user.userId,
  });

  res.render('home', {
    files: userfiles,
    
  });


});

const mongoose = require('mongoose');

router.post('/upload', verifyJWT, upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  const userId = req.user?.userId; 

  if (!uploadedFile) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const timestamp = Date.now();
  const uniqueFileName = `${timestamp}_${uploadedFile.originalname}`;
 const filePath = `uploads/${userId}/${uniqueFileName}`;


  try {
    
    const { data, error } = await supabase.storage
      .from('user-files')
      .upload(filePath, uploadedFile.buffer, {
        contentType: uploadedFile.mimetype,
        upsert: false,
      });
      

    if (error) {
      return res.status(500).json({ error: error.message });
    }

  
    const newFile = await fileModel.create({
      path: data.path,
      originalName: uploadedFile.originalname, 
      user: new mongoose.Types.ObjectId(userId), 
    });

   return res.redirect('/home?msg=uploaded');

  } catch (err) {
    console.error('❌ Upload Error:', err);
    res.status(500).json({ error: 'Something went wrong during upload' });
  }
});

router.get('/download', async (req, res) => {
  const filePath = req.query.path;
  console.log('🔍 Downloading:', filePath);

  try {
    const { data, error } = await supabase.storage
      .from('user-files')
      .createSignedUrl(filePath, 60);

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return res.status(404).send('File not found');
    }

    return res.redirect(data.signedUrl);


  } catch (err) {
    console.error('❌ Download error:', err);
    res.status(500).send('Server error');
  }
});

router.post('/delete/:id', verifyJWT, async (req, res) => {
  const fileId = req.params.id;

  try {
    const file = await fileModel.findById(fileId);
    if (!file) return res.status(404).send('File not found');

    
    const { error: supabaseError } = await supabase.storage
      .from('user-files')
      .remove([file.path]);

    if (supabaseError) {
      console.error('❌ Supabase delete error:', supabaseError.message);
      return res.status(500).send('Failed to delete from storage');
    }

    
    await fileModel.findByIdAndDelete(fileId);

    return res.redirect('/home?msg=deleted');

  } catch (err) {
    console.error('❌ Delete Error:', err.message);
    res.status(500).send('Server error during deletion');
  }
});



module.exports = router;