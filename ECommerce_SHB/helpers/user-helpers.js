let db = require('../config/Connection')
let collection = require('../config/collections')
let bcrypt = require('bcrypt')
const { response } = require('express')
let objectID = require('mongodb').ObjectId

// ...............for OTP......................
const accountSid = "AC22e3681b7937cf0418c521f272ad6259"
const authToken = "ASDeer2432434324fsfwr34ad45errew454"
const serviceSid = "VA6cad9fa25705ba1d0ba9711ca5a77237"

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
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email, isBlock: false })
            // console.log(user);
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
        return new Promise((resolve, reject) => {
            client.verify.v2.services(serviceSid).verifications.create({ to: '+91' + mobile, channel: 'sms' }).then((verification => {
                resolve(verification)
            }))
        })
    },
    verifyOtp: (otp, mobile) => {
        return new Promise((resolve, reject) => {
            client.verify.v2.services(serviceSid).verificationChecks.create({ to: '+91' + mobile, code: otp.otp }).then((verification_check) => {
                resolve(verification_check.status)
            })
        })
    },

    //....................................................................................................................


    getUserCart: (prod, userID) => {
        let proObj = {
            item: objectID(prod),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectID(userID) })

            if (user) {
                let prodExist = user.product.findIndex(produc => produc.item == prod)
                //console.log(prodExist)
                if (prodExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectID(userID), 'product.item': objectID(prod) }, {
                        $inc: { 'product.$.quantity': 1 }
                    }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectID(userID) },
                        {
                            $push: { product: proObj }
                        }).then((userID) => {
                            resolve()
                        })
                }
            }
            else {
                let objCart = {
                    user: objectID(userID),
                    product: [proObj]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(objCart).then((userID) => {
                    resolve()
                })
            }

        })
    },

    //........................... cart..................

    getCartProducts: (userID) => {

        return new Promise(async (resolve, reject) => {

            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([

                {
                    $match: { user: objectID(userID) }
                },
                {
                    $unwind: '$product'

                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            console.log(cartItems)
            if (cartItems.length) {
                resolve(cartItems)
            } else resolve(cartItems = 0)

        })

    },

    getTotalAmount: (userID) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectID(userID) })
            if (user) {
                // console.log(user.product[0])
                if (user.product[0]) {
                    let total = await db.get().collection(collection.CART_COLLECTION).aggregate([

                        {
                            $match: { user: objectID(userID) }
                        },
                        {
                            $unwind: '$product'

                        },
                        {
                            $project: {
                                item: '$product.item',
                                quantity: '$product.quantity'
                            }
                        },
                        {
                            $lookup: {
                                from: collection.PRODUCT_COLLECTION,
                                localField: 'item',
                                foreignField: '_id',
                                as: 'product'

                            }
                        },
                        {
                            $project: {
                                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                            }
                        },
                        {
                            $group:
                            {
                                _id: null,
                                total: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.price' }] } }
                            }
                        }
                    ]).toArray()

                    //console.log(total[0].total);
                    resolve(total[0].total)
                } else resolve(0)
            }
        })


    },

    setProQuantity: (userID, details) => {
        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectID(userID) })
            if (user) {
                let prodExist = user.product.findIndex(produc => produc.item == details.prod)
                //console.log(prodExist)
                if (prodExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectID(userID), 'product.item': objectID(details.prod) }, {
                        $set: { 'product.$.quantity': details.qt }

                    }
                    ).then((response) => {

                        resolve({ status: true })
                    })
                }
            }
        })
    },
    deleteCartItem: (userID, prodID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectID(userID) }, { $pull: { product: { item: objectID(prodID) } } }).then((response) => {
                resolve(response)
            })
        })
    }


}