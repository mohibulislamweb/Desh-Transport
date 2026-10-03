const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Admin = require('../models/Admin');
const { requireAdmin } = require('../middleware/authenticate');
const { rateLimit } = require('../middleware/rateLimit');
const {
isValidBangladeshiPhone,
normalizePhone,
phoneFilter,
safeAdmin,
signToken
} = require('../utils/auth');


const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });


// ======================
// Admin Create (Only First Time)
// 🛡️ Render এ ADMIN_SETUP_KEY সেট থাকলে এবং হেডারে x-setup-key মিললেই কেবল নতুন এডমিন তৈরি হবে
// ======================
router.post('/create', loginLimiter, async(req,res,next)=>{

try{

const setupKey = process.env.ADMIN_SETUP_KEY;
const givenKey = String(req.headers['x-setup-key'] || '');

const keyMatches =
setupKey &&
givenKey.length === setupKey.length &&
crypto.timingSafeEqual(Buffer.from(givenKey), Buffer.from(setupKey));

if(!keyMatches){

return res.status(403).json({
message:"এডমিন তৈরি করার অনুমতি নেই"
});

}


const {
name,
password
}=req.body;

const phone = normalizePhone(req.body.phone);


if(typeof name !== 'string' || !name.trim() || !isValidBangladeshiPhone(phone) || typeof password !== 'string' || password.length < 8){

return res.status(400).json({
message:"নাম, সঠিক মোবাইল নাম্বার এবং কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন"
});

}


const exist =
await Admin.findOne({phone:phoneFilter(phone)});


if(exist){

return res.status(400).json({
message:"এই এডমিন আগে থেকেই আছে"
});

}


const passwordHash =
await bcrypt.hash(password,10);


const admin =
new Admin({

name:name.trim(),
phone,
passwordHash

});


await admin.save();



res.status(201).json({

message:"এডমিন তৈরি হয়েছে",

admin:safeAdmin(admin)

});


}

catch(error){

next(error);

}


});







// ======================
// Admin Login
// ======================
router.post('/login', loginLimiter, async(req,res,next)=>{


try{


const {
phone,
password
}=req.body;


if(typeof phone !== 'string' || typeof password !== 'string' || !phone || !password){

return res.status(400).json({

message:'মোবাইল নাম্বার ও পাসওয়ার্ড দিন'

});

}




const admin =
await Admin.findOne({phone:phoneFilter(phone)})
.select('+passwordHash');



if(!admin){

return res.status(400).json({

message:'ভুল মোবাইল নাম্বার অথবা পাসওয়ার্ড'

});

}




const check =
await bcrypt.compare(
password,
admin.passwordHash
);



if(!check){

return res.status(400).json({

message:'ভুল মোবাইল নাম্বার অথবা পাসওয়ার্ড'

});

}




const token =
signToken(admin._id,'admin');




res.json({

message:'এডমিন লগইন সফল হয়েছে',

token,

admin:safeAdmin(admin)

});



}


catch(error){


next(error);


}


});




// ======================
// Admin - নিজের তথ্য / টোকেন চেক
// ======================
router.get('/me', requireAdmin, (req,res)=>{

res.json({ admin:safeAdmin(req.user) });

});



module.exports = router;
