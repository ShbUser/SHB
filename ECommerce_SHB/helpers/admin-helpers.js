let db = require('../config/Connection')
let collection = require('../config/collections')
let bcrypt = require('bcrypt')
const { response } = require('express')
const { resolve, reject } = require('promise')
let objectID = require('mongodb').ObjectId

module.exports = {
    doLogin_admin: async (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email, password: adminData.password })
            if (user) {
                // console.log(user);
                response.user = user
                response.status = true;
            }
            resolve(response)

        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },

    // doBlockUser: (userID) => {
    //     return new Promise(async (resolve, reject) => {
    //         await db.get().collection(collection.USER_COLLECTION).aggregate([{ $match: { _Id: objectID(userID) } },
    //         {
    //                 $cond: { if: {isBlock: true}, then:{$set:{isBlock:false}}, else:{$set:{isBlock:true}} }
    //             }
    //         ])


    //     })
    // }

    doBlockUser: (userID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                {
                    $set: { isBlock: true }
                }).then(() => {
                    resolve()
                })

        })
    },


    doUnBlockUser: (userID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                {
                    $set: { isBlock: false }
                }).then(() => {
                    resolve()
                })

        })
    },

    getAllOrderList: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ 'deliveryDetails.date': -1 }).toArray()
                console.log(orders);
                resolve(orders)
            } catch (error) {
                reject(error)
            }
        })
    },

    updateStatusShipped: (orderID) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("................");
                await db.get().collection(collection.ORDER_COLLECTION).update({ _id: objectID(orderID) }, { $set: { "deliveryDetails.status": "Shipped" } })
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    },
    updateStatusDelivered: (orderID) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.ORDER_COLLECTION).update({ _id: objectID(orderID) }, { $set: { "deliveryDetails.status": "Delivered" } })
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    }
    
}
