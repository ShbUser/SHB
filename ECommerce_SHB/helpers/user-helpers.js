let db = require('../config/Connection')
let collection = require('../config/collections')
let bcrypt = require('bcrypt')
const { response } = require('express')
const { reject, resolve } = require('promise')
let objectID = require('mongodb').ObjectId

// ...............for OTP......................
const accountSid = "AC22e3681b7937cf0418c521f272ad6259"
const authToken = "ASDeer2432434324fsfwr34ad45errew454"
const serviceSid = "VA6cad9fa25705ba1d0ba9711ca5a77237"

const client = require('twilio')(accountSid, authToken);

const Razorpay = require('razorpay');


module.exports = {
    doSignUp: async (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(userData)

                })
            } catch (error) {
                reject(error)
            }
        })
    },
    doLogin: async (userData) => {

        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
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
                }
            } catch (error) {
                reject(error)
            }
        })
    },

    changePassword:(userData,userID)=>{
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectID(userID)})
                // console.log(user);
                if (user) {
                   
                    bcrypt.compare(userData.password, user.password).then(async(status) => {
                            // console.log("ok",".....................");
                        if (status) {
                            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectID(userID)},{
                                $set:{
                                    password:await bcrypt.hash(userData.newpassword, 10)
                                }
                            })
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
            } catch (error) {
                reject(error)
            }
        })
    },

    userCheck: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {};
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });
                if (user) {
                    response.exist = true;
                    resolve(response);
                } else {
                    response.exist = false;
                    resolve(response);
                }
            } catch (error) {
                reject(error)
            }
        })

    },
    sendOtp: (mobile) => {
        return new Promise((resolve, reject) => {
            try {
                client.verify.v2.services(serviceSid).verifications.create({ to: '+91' + mobile, channel: 'sms' }).then((verification => {
                    resolve(verification)
                }))
            } catch (error) {
                reject(error)
            }
        })
    },
    verifyOtp: (otp, mobile) => {
        return new Promise((resolve, reject) => {
            try {
                client.verify.v2.services(serviceSid).verificationChecks.create({ to: '+91' + mobile, code: otp.otp }).then((verification_check) => {
                    resolve(verification_check.status)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    //....................................................................................................................
    addPersonalDetails: (personalDet,userID) => {
       
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID) })
                if (user) 
                {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                            {
                                $set:
                                {
                                    personalDetails: personalDet
                                }

                            })
                }
                    resolve(resolve)
            } catch (error) {
                reject(error)
            }
        })

    },
    setProfilepiC:(pic,userID)=>{
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID) })
                if (user) 
                {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                            {
                                $set:
                                {
                                    photo: pic
                                }

                            })
                }
                    resolve(resolve)
            } catch (error) {
                reject(error)
            }
        })

    },

    getPersonalDetails:(userID)=>{
            return new Promise(async(resolve,reject)=>{
                try{
                let personalDet=await db.get().collection(collection.USER_COLLECTION).findOne(
                    {_id:objectID(userID)},{wishlist:0,isBlock:0,password:0})
                    resolve(personalDet)
                }catch(error){
                    reject(error)
                }
            })

    },
    addShippingAddress:(address,userID)=>{
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID) })
                if (user) 
                {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                            {
                                $push:
                                {
                                    address: address
                                }

                            })
                }
                    resolve(resolve)
            } catch (error) {
                reject(error)
            }
        })
    },

    addToWishlist: (prodID, userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID) })
                if (user) {
                    let prodExist = user.wishlist.findIndex(produc => produc == prodID)
                    // console.log(prodExist)
                    if (prodExist == -1) {

                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                            {
                                $push:
                                {
                                    wishlist: objectID(prodID)
                                }

                            }
                        )

                    }
                    resolve(prodExist)
                }
            } catch (error) {
                reject(error)
            }
        })

    },

    getWishlist: (userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                // let wishlist = await db.get().collection(collection.USER_COLLECTION).find({ _id: objectID(userID) }).toArray()

                // resolve(wishlist)
                let wishItems = await db.get().collection(collection.USER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectID(userID) }
                    },
                    {
                        $unwind: '$wishlist'

                    },
                    {
                        $project: { item: "$wishlist" }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'wishlist'
                        }
                    },
                    {
                        $project: {
                            _id: 0, wishlist: { $arrayElemAt: ['$wishlist', 0] }
                        }
                    }
                ]).toArray()
                resolve(wishItems)
            } catch (error) {
                reject(error)
            }
        })
    },

    getUserCart: (prod, userID) => {
        let proObj = {
            item: objectID(prod),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            try {          
            
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
            } catch (error) {
                reject(error)
            }

        })

    },

    //........................... cart..................

    getCartProducts: (userID) => {
        return new Promise(async (resolve, reject) => {
            try {
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
                    ,
                    {
                        $set: { 'categorySet': { '$toObjectId': '$product.category' } }
                    },
                    {
                        $lookup: {
                            from: collection.CATEGORY_COLLECTION,
                            localField: 'categorySet',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: 1, category: { $arrayElemAt: ['$category', 0] }
                        }
                    }

                ]).toArray()
                if (cartItems.length) {
                    resolve(cartItems)
                } else resolve(cartItems = 0)
            } catch (error) {
                reject(error)
            }
        })

    },

    getTotalAmount: (userID) => {

        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (error) {
                reject(error)
            }
        })


    },

    setProQuantity: (userID, details) => {

        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectID(userID) })
                if (user) {
                    let prodExist = user.product.findIndex(produc => produc.item == details.prod)
                    //console.log(prodExist)
                    if (prodExist != -1) {
                        db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectID(userID), 'product.item': objectID(details.prod) }, {

                            $set: { 'product.$.quantity': parseInt(details.qt) }

                        }
                        ).then((response) => {

                            resolve({ status: true })
                        })
                    }
                }
            } catch (error) {
                reject(error)
            }
        })

    },
    deleteCartItem: (userID, prodID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectID(userID) }, { $pull: { product: { item: objectID(prodID) } } }).then((response) => {
                resolve(response)
            })
        })
    },

    //............................Place order................................
    getCartProductList: (userID) => {

        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectID(userID) })
                resolve(cart.product)
            } catch (error) {
                reject(error)
            }
        })

    },
    placeOrder: (order, products, total) => {

        return new Promise((resolve, reject) => {
            try {

                //console.log(order,products,total);
                let status = order['payment-method'] === 'COD' ? 'Placed' : 'Pending'
                let orderObj = {

                    deliveryDetails: {

                        name: order.name,
                        mobile: order.mobile,
                        city: order.city,
                        pin: order.pin,
                        address: order.address,
                        status: status,
                        totalAmount: total,
                        date: new Date(),
                        paymentMethod: order['payment-method']
                    },
                    userID: objectID(order.userId),
                    products: products,
                }

                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectID(order.userId) })
                    resolve(response.insertedId)
                    // db.get().collection(collection.PRODUCT_COLLECTION).updateOne({'response.products.item': objectID(prod) }, {
                    //     $inc: { 'product.$.quantity': 1 }
                    // })
                    // console.log("Inserted ID  :  : " + response.insertedId);
                })
            } catch (error) {
                reject(error)
            }

        })

    },
    getOrder: (userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.get().collection(collection.ORDER_COLLECTION).find({ userID: objectID(userID) }).sort({ 'deliveryDetails.date': -1 }).toArray()

                resolve(order)
            } catch (error) {
                reject(error)
            }
        })
    },
    getrOrderProducts: (orderID) => {

        return new Promise(async (resolve, reject) => {
            try {
                let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                    {
                        $match: { _id: objectID(orderID) }
                    },
                    {
                        $unwind: '$products'

                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
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
                        $set: { 'categorySet': { '$toObjectId': '$product.category' } }
                    },
                    {
                        $lookup: {
                            from: collection.CATEGORY_COLLECTION,
                            localField: 'categorySet',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: 1, category: { $arrayElemAt: ['$category', 0] }
                        }
                    }


                ]).toArray()

                console.log(orderItems)
                if (orderItems.length) {
                    resolve(orderItems)
                } else resolve(orderItems = 0)
            } catch (error) {
                reject(error)
            }
        })
    },
    deleteOrderItem: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try{
            await db.get().collection(collection.ORDER_COLLECTION).deleteOne({ _id: objectID(orderId),"deliveryDetails.status":"Placed" }).then((response) => {
                resolve(response)
                // db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectID(userID), 'product.item': objectID(prod) }, {
                //     $inc: { 'product.$.quantity': 1 }
                // })
           
            })
        }catch(error)
        {
            reject(error)
        }
        })

    },
    getAddressFromOrderList: (userID) => {
        return new Promise(async (resolve, reject) => {
            try {

                let address = await db.get().collection(collection.ORDER_COLLECTION).find({ userID: objectID(userID) },
                    { name: 1, mobile: 1, city: 1, pin: 1, address: 1 }).sort({ 'deliveryDetails.date': -1 }).limit(1).toArray()
                resolve(address)
            } catch (error) {
                reject(error)
            }
        })
    }
}

    //................................Razor pay.........................................
   

// function formatDate(date) {
//     let d = new Date(date),
//         month = '' + d.getMonth(),
//         day = '' + d.getDate(),
//         year = d.getFullYear();
//         dt= month+"/"+day+"/"+year
//     return dt
// }