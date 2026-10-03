const mongoose = require('mongoose');


// Driver current location
const locationSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      default: null,
    },

    lng: {
      type: Number,
      default: null,
    },

    updatedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);


// Driver Schema
const driverSchema = new mongoose.Schema(
  {

    // ড্রাইভারের নাম
    driverName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },


    // মোবাইল নাম্বার
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },


    // Password hash
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },


    // গাড়ির ধরন (যেমন: ট্রাক, পিকআপ)
    truckType: {
      type: String,
      required: true,
      trim: true,
    },


    // গাড়ির ধারণক্ষমতা (টন)
    truckCapacity: {
      type: Number,
      required: true,
      min: 0.1,
    },


    // গাড়ির বডি টাইপ
    // covered = কভার্ড ভ্যান
    // open = খোলা গাড়ি
    vehicleBody: {
      type: String,
      required: true,
      enum: ['covered', 'open'],
    },


    // সর্বশেষ লোকেশন
    currentLocation: {
      type: locationSchema,
      default: () => ({}),
    },


    // token system
    authTokenHash: {
      type: String,
      select: false,
      default: null,
    },


    authTokenExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

  },


  {
    timestamps: true,
  }
);


module.exports = mongoose.model(
  'Driver',
  driverSchema
);