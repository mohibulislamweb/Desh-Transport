const mongoose = require('mongoose');



const tripApplicationSchema = new mongoose.Schema(

{


// কোন ট্রিপে আবেদন করেছে

tripId:{

type:mongoose.Schema.Types.ObjectId,

ref:'Trip',

required:true,

index:true

},





// কোন ড্রাইভার আবেদন করেছে

driverId:{


type:mongoose.Schema.Types.ObjectId,


ref:'Driver',


required:true,


index:true


},






// Apply করার সময় driver information snapshot

driverName:{


type:String,


required:true


},




phone:{


type:String,


required:true


},






truckType:{


type:String,


required:true


},






truckCapacity:{


type:Number,


required:true


},







vehicleBody:{


type:String,


enum:[

'covered',

'open'

],


required:true


},








// Apply করার সময় location

currentLocation:{



lat:{


type:Number,


default:null


},




lng:{


type:Number,


default:null


},




updatedAt:{


type:Date,


default:Date.now


}



},







// application condition

status:{


type:String,


enum:[

'pending',

'accepted',

'rejected'

],


default:'pending',


index:true


},







appliedAt:{


type:Date,


default:Date.now,


index:true


}





},



{


timestamps:true


}



);







// একই driver যেন একই trip এ ২ বার apply না করতে পারে

tripApplicationSchema.index(


{

tripId:1,

driverId:1

},


{

unique:true

}


);








module.exports = mongoose.model(

'TripApplication',

tripApplicationSchema

);