let db = require('../config/Connection')
let collection = require('../config/collections')
let bcrypt = require('bcrypt')
const { response } = require('express')
const { reject, resolve, all } = require('promise')
let objectID = require('mongodb').ObjectId

// ...............for OTP......................
const accountSid = process.env.accountSid
const authToken = process.env.authToken
const serviceSid = process.env.serviceSid

const client = require('twilio')(accountSid, authToken);

const Razorpay = require('razorpay');
const res = require('express/lib/response')
let instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
})

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

    changePassword: (userData, userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID) })
                // console.log(user);
                if (user) {

                    bcrypt.compare(userData.password, user.password).then(async (status) => {
                        // console.log("ok",".....................");
                        if (status) {
                            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) }, {
                                $set: {
                                    password: await bcrypt.hash(userData.newpassword, 10)
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

    isBlock: (userID) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID), isBlock: true })
                if (user) {
                    response.status = true
                    resolve(response)
                } else {
                    response.status = false
                    resolve(response)
                }
            } catch (error) {
                reject(error)
            }
        })

    },
    //....................................................................................................................
    addPersonalDetails: (personalDet, userID) => {

        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID) })
                if (user) {
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
    setProfilepiC: (pic, userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID) })
                if (user) {
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

    getPersonalDetails: (userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let personalDet = await db.get().collection(collection.USER_COLLECTION).findOne(
                    { _id: objectID(userID) }, { wishlist: 0, isBlock: 0, password: 0 })
                resolve(personalDet)
            } catch (error) {
                reject(error)
            }
        })

    },
    getAllShipAddress: (userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let allAddress = await db.get().collection(collection.USER_COLLECTION).findOne(
                    { _id: objectID(userID) }, { address: 1 })
                resolve(allAddress)
            } catch (error) {
                reject(error)
            }
        })

    },

    // addShippingAddress: (address, userID) => {
    //     address._id = objectID()
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID)})
    //             if (user) {
    //                 db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID)},
    //                     {
    //                         $push:
    //                         {
    //                             address: address
    //                         }

    //                     })
    //             }
    //             resolve(resolve)
    //         } catch (error) {
    //             reject(error)
    //         }
    //     })
    // },
    addEditShippingAddress: (address, userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (address.tempAddressID != "") {
                    let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID) })
                    if (user) {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID), 'address._id': objectID(address.tempAddressID) },
                            {
                                $set:
                                {
                                    // address:{_id:{$in:[address.tempAddressID]}}
                                    'address.$.name': address.name,
                                    'address.$.streetaddress': address.streetaddress,
                                    'address.$.altermobile': address.altermobile,
                                    'address.$.pincode': address.pincode,
                                    'address.$.landmark': address.landmark,
                                    'address.$.city': address.city,
                                    'address.$.district': address.district,
                                    'address.$.state': address.state
                                }

                            })
                    }
                } else {
                    address._id = objectID()
                    let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectID(userID) })
                    if (user) {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                            {
                                $push:
                                {
                                    address: address
                                }

                            })
                    }

                }
                resolve(resolve)
            } catch (error) {
                reject(error)
            }
        })
    },


    deleteShipAddress: (addressID, userID) => {

        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                    {
                        $pull: { address: { _id: objectID(addressID) } }

                    }).then((response) => {
                        resolve(response)
                    })
            } catch (error) {
                reject(error)
            }
        })
    },
    getShipAddress: (userID, addressID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectID(userID) }
                    },
                    {
                        $project: {
                            address: {
                                $filter: {
                                    input: "$address",
                                    as: "out",
                                    cond: { $eq: ["$$out._id", objectID(addressID)] }
                                }
                            }
                        }
                    }
                ]).toArray()
                resolve(address[0])
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
                    if (user.wishlist) {
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
                    } else {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                            {
                                $push:
                                {
                                    wishlist: objectID(prodID)
                                }

                            }
                        )
                    }
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
    deleteWishItem: (wishID, userID) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                    {
                        $pull: {
                            wishlist: {
                                $in: [objectID(wishID)]
                            }
                        }
                    }).then((response) => {
                        resolve(response)
                    })
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

    setProQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise(async (resolve, reject) => {
            try {
                if (details.count == -1 && details.quantity == 1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectID(details.cartID) }, {
                        $pull: { product: { item: objectID(details.proID) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({
                        _id: objectID(details.cartID),
                        'product.item': objectID(details.proID)
                    }, {
                        $inc: { 'product.$.quantity': details.count }
                    }).then((response) => {
                        resolve(true)
                    })
                }
            } catch (error) {
                reject(error)
            }
        })

    },
    deleteCartItem: (userID, prodID) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectID(userID) },
                    { $pull: { product: { item: objectID(prodID) } } }).then((response) => {
                        resolve(response)
                    })
            } catch (error) {
                reject(error)
            }
        })
    },
    totalWithCoupen: (coupon) => {
        return new Promise(async (resolve, reject) => {
            try {
                let discAmt = await db.get().collection(collection.COUPEN_COLLECTION).findOne({ coupencode: coupon }, {})
                if (discAmt) {
                    resolve(discAmt)
                } else { resolve(0) }
            } catch (error) {
                reject(error)
            }
        })

    },
    isUserValidForCoupen: (userID, coupencode) => {
        let inValid
        return new Promise(async (resolve, reject) => {
            try {
                let discAmt = await db.get().collection(collection.ORDER_COLLECTION).findOne({ userID: objectID(userID), 'deliveryDetails.coupen': coupencode })
                if (discAmt) {
                    inValid = true
                    resolve(inValid)
                } else {
                    inValid = false
                    resolve(inValid)
                }

            } catch (error) {
                reject(error)
            }
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
    placeOrder: (userId, order, products, total) => {

        return new Promise(async (resolve, reject) => {
            try {

                //console.log(order,products,total);
                let status = order['payment-method'] === 'COD' ? 'Placed' : 'Pending'
                let orderObj = {

                    deliveryDetails: {

                        name: order.name,
                        street: order.streetaddress,
                        mobile: order.altermobile,
                        pin: order.pincode,
                        landmark: order.landmark,
                        city: order.city,
                        district: order.district,
                        state: order.state,
                        status: status,
                        coupen: order.coupencode,
                        totalAmount: total,
                        date: new Date(),
                        paymentMethod: order['payment-method']
                    },
                    userID: objectID(userId),
                    products: products,
                }
                //......................................product minus....................................
                if (status != "Pending") {
                    products.forEach(async element => {
                        //console.log(element.item,-(parseInt(element.quantity)), "bbbbbbbbbbbbbb");                        
                        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: element.item },
                            {
                                $inc: { 'qty': -(parseInt(element.quantity)) }
                            }
                        ).then(() => {
                            resolve()
                        })
                    })
                }
                //..................................product minus finish point................................................................

                await db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then(async (response) => {
                    await db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectID(userId) })
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

                // console.log(orderItems)
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
            try {
                //..................product qty increment.............................
                let prod = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectID(orderId) }).toArray()
                //console.log(prod, "iooioioiooioioioioi");
                let products = prod[0].products
                //console.log(products, "gggggggggggggggggggggggggggggggggg");
                products.forEach(async element => {
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: element.item },
                        {
                            $inc: { 'qty': (parseInt(element.quantity)) }
                        }).then(() => {
                            resolve()
                        })

                })
                //............................end......................................
                await db.get().collection(collection.ORDER_COLLECTION).deleteOne({ _id: objectID(orderId), "deliveryDetails.status": "Placed" }
                ).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })

    },
    getSingleOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectID(orderId) }).then((order) => {
                    resolve(order)
                })
            } catch (error) {
                reject(error)
            }
        })

    },

    getAddressFromOrderList: (userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.ORDER_COLLECTION).findOne({ userID: objectID(userID) })
                if (user) {
                    let address = await db.get().collection(collection.ORDER_COLLECTION).find({ userID: objectID(userID) },
                        { name: 1, mobile: 1, city: 1, pin: 1, address: 1 }).sort({ 'deliveryDetails.date': -1 }).limit(1).toArray()
                    resolve(address)
                } else {
                    resolve(0)
                }
            } catch (error) {
                reject(error)
            }
        })
    },


    //................................Razor pay.........................................
    generateRazorPay: (orderID, total) => {
        return new Promise((resolve, reject) => {
            try {
                instance.orders.create({
                    amount: total * 100,
                    currency: "INR",
                    receipt: "" + orderID
                },
                    function (err, order) {
                        if (err) {
                            console.log(err)
                        } else {
                            //console.log(order)
                            resolve(order)
                        }
                    })
            } catch (error) {
                reject(error)
            }
        })
    },


    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto')
                let hmac = crypto.createHmac('sha256', process.env.key_secret);
                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
                } else {
                    reject()
                }
            } catch (error) {
                reject(error)
            }
        })
    },
    changePaymentStatus: (orderID) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectID(orderID) },
                    {
                        $set: { 'deliveryDetails.status': 'Placed' }
                    }).then(async () => {
                        let prod = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectID(orderID) }).toArray()
                        let products = prod[0].products
                        products.forEach(async element => {
                            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: element.item },
                                {
                                    $inc: { 'qty': -(parseInt(element.quantity)) }
                                }
                            ).then(() => {
                                resolve()
                            })
                        })
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }

        })
    }

}
