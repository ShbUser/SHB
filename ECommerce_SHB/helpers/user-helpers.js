var db = require('../config/Connection')
var collection = require('../config/collections')
var bcrypt = require('bcrypt')
const { response } = require('express')
let objectID = require('mongodb').ObjectId

// ...............for OTP......................
const accountSid = "AC22e3681b7937cf0418c521f272ad6259"
const authToken = "2ae820f8e17cc90025cfb32336f0da2f"
const serviceSid= "VA6cad9fa25705ba1d0ba9711ca5a77237"

const client = require('twilio')(accountSid, authToken);


module.exports = {
    doSignUp: async (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(userData)

            })

        })
    },
    doLogin: async (userData) => {
        
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            console.log(user);
            if (user) {
                
                bcrypt.compare(userData.password, user.password).then((status) => {

                    if (status) {
                        response.user = user
                        response.status = true;
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
                console.log("failed");
            }

        })
    },

    userCheck: (userData) => {
        return new Promise(async (resolve, reject) => {
          let response = {};
          let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });
          if (user) {
            response.exist = true;
            resolve(response);
          } else {
            response.exist = false;
            resolve(response);
          }
        });
      },
      sendOtp: (mobile) => {
        return new Promise((resolve,reject)=>{
            client.verify.v2.services(serviceSid).verifications.create({to:'+91'+mobile,channel:'sms'}).then((verification=>{
                resolve(verification)
            }))
        })
      },
      verifyOtp:(otp,mobile)=>{
        return new Promise((resolve,reject)=>{
            console.log(otp,mobile)
            client.verify.v2.services(serviceSid).verificationChecks.create({to:'+91'+mobile,code: otp.otp}).then((verification_check)=>{
                resolve(verification_check.status)
            })
        })
      }
    

}