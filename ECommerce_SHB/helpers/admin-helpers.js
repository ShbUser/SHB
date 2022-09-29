let db = require('../config/Connection')
let collection = require('../config/collections')
let bcrypt = require('bcrypt')
const { response } = require('express')
const { resolve, reject } = require('promise')
let objectID = require('mongodb').ObjectId

module.exports = {
    doLogin_admin: async (adminData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                let user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email, password: adminData.password })
                if (user) {
                    // console.log(user);
                    response.user = user
                    response.status = true;
                }
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
                resolve(users)
            } catch (error) {
                reject(error)
            }
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
            try {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                    {
                        $set: { isBlock: true }
                    }).then(() => {
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }
        })
    },


    doUnBlockUser: (userID) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectID(userID) },
                    {
                        $set: { isBlock: false }
                    }).then(() => {
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }
        })
    },

    getAllOrderList: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ 'deliveryDetails.date': -1 }).toArray()

                resolve(orders)
            } catch (error) {
                reject(error)
            }
        })
    },

    updateStatusShipped: (orderID) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectID(orderID) }, { $set: { "deliveryDetails.status": "Shipped" } })
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    },
    updateStatusDelivered: (orderID) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectID(orderID) }, { $set: { "deliveryDetails.status": "Delivered" } })
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    },

    addBanner: (banner) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((data) => {
                    resolve(data.insertedId)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    getAllBanners: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
                resolve(banners)
            } catch (error) {
                reject(error)
            }
        })
    },
    getEditBanner: (bannerId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let banner = await db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: objectID(bannerId) })
                resolve(banner)
            } catch (error) {
                reject(error)
            }
        })
    },

    editBanner: (bannerId, bannerDet) => {
        return new Promise(async (resolve, reject) => {
            try {
                //console.log(bannerDet, ".................");
                await db.get().collection(collection.BANNER_COLLECTION).updateOne({ _id: objectID(bannerId) },
                    {
                        $set: {
                            bannername: bannerDet.bannername,
                            header: bannerDet.header,
                            content: bannerDet.content,
                            bannerImg: bannerDet.bannerImg
                        }
                    })
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    },
    deleteBanner: (bannerID) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objectID(bannerID) }).then((response) => {
                    resolve(response)

                })
            } catch (error) {
                reject(error)
            }
        })

    },
    addCoupen: (coupen) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.COUPEN_COLLECTION).insertOne(coupen).then((data) => {
                    resolve(data.insertedId)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    getAllCoupens: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let coupens = await db.get().collection(collection.COUPEN_COLLECTION).find().toArray()
                resolve(coupens)
            } catch (error) {
                reject(error)
            }
        })
    },
    getEditCoupen: (coupenId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let coupen = await db.get().collection(collection.COUPEN_COLLECTION).findOne({ _id: objectID(coupenId) })
                resolve(coupen)
            } catch (error) {
                reject(error)
            }
        })
    },
    editCoupen: (coupenID, coupenDet) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.COUPEN_COLLECTION).updateOne({ _id: objectID(coupenID) },
                    {
                        $set: {
                            coupenname: coupenDet.coupenname,
                            coupentype: coupenDet.coupentype,
                            coupencode: coupenDet.coupencode,
                            coupendiscount: coupenDet.coupendiscount,
                            coupentarget: coupenDet.coupentarget
                        }
                    })
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    },
    deleteCoupen: (coupenID) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.COUPEN_COLLECTION).deleteOne({ _id: objectID(coupenID) }).then((response) => {
                    resolve(response)

                })
            } catch (error) {
                reject(error)
            }
        })

    },

    //.............................................Dashboard...........................................

    todaySale: () => {
        let today = new Date();
        today.setHours(5, 30, 0, 0)
        //console.log(today, "newwwwwwwwwwwwwwwwwww", new Date());
        //  let firstDayMonth = new Date(today);
        //     let lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)`
        //     lastDayMonth.setHours(23, 59, 59, 0);
        //     today = new Date().setHours(0, 0, 0, 0);
        //     //lastDayMonth=new Date()
        //let firstDay=new Date(new Date().getTime() - (24 * 60 * 60 - 1000))
        return new Promise(async (resolve, reject) => {
            try {

                let todaySale = await db.get().collection(collection.ORDER_COLLECTION).find({ 'deliveryDetails.date': { $gte: today, $lte: new Date()} }).limit(1).toArray()

                if (todaySale != "") {

                    let today_sale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                        {
                            $match: { $and: [{ 'deliveryDetails.date': { $gte: today}}, { "deliveryDetails.status": { $ne: "Pending" } }] }
                            //$match: { 'deliveryDetails.date': { $gte: today, $lte: new Date() } }
                        },

                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$deliveryDetails.totalAmount' }
                            }
                        }


                    ]).toArray()

                    resolve(today_sale[0].total)
                } else {
                    resolve(0)
                }
            } catch (error) {
                reject(error)
            }
        })
    },


    totalSale: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let check = await db.get().collection(collection.ORDER_COLLECTION).find().limit(1).toArray()

                if (check != "") {
                    let details = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                        {
                            $match: { "deliveryDetails.status": { $ne: "Pending" } }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$deliveryDetails.totalAmount" }
                            }

                        }
                    ]).toArray()
                    resolve(details[0].total)
                } else {
                    resolve(0)
                }
            } catch (error) {
                reject(error)
            }
        })

    },

    // totalAmountOfProducts: () => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let total_amount_of_products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
    //                 {
    //                     $group: {
    //                         _id: null,
    //                         //total: { $sum: "$price" }
    //                         total: { $sum: { $multiply: [{ $toInt: '$qty' }, { $toInt: '$price' }] } }
    //                     }
    //                 }
    //             ]).toArray()
    //             resolve(total_amount_of_products[0].total)
    //         } catch (error) {
    //             reject(error)
    //         }
    //     })

    // },

    calculationMonthwiseForGraph: () => {

        //  let firstDayMonth = new Date(today);

        //     lastDayMonth.setHours(23, 59, 59, 0);
        //     today = new Date().setHours(0, 0, 0, 0);
        //     //lastDayMonth=new Date()
        //let firstDay=new Date(new Date().getTime() - (24 * 60 * 60 - 1000))
        //console.log(lastDayMonth, "oooooooooooooooooooooo");
        return new Promise(async (resolve, reject) => {
            try {
                let result = []
                for (i = 0; i < 12; i++) {
                    let today = new Date();
                    today.setMonth(i, 1)
                    today.setHours(5, 30, 0, 0)
                    let lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                    lastDayMonth.setHours(24, 59, 0, 0)

                    let monthly_sale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                        {
                            $match: { $and: [{ 'deliveryDetails.date': { $gte: today, $lte: lastDayMonth } }, { "deliveryDetails.status": { $ne: "Pending" } }] }
                            // $match: { 'deliveryDetails.date': { $gte: today, $lte: lastDayMonth } , $ne: [ "$status", "Pending" ] }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$deliveryDetails.totalAmount' }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                total: 1
                            }
                        }

                    ]).toArray()
                    if (monthly_sale == "") {
                        monthly_sale[0] = { total: 0 }
                    }
                    result[i] = monthly_sale[0]
                }
                resolve(result)

            } catch (error) {
                reject(error)
            }
        })

    },

    doughnutChart: () => {
        let doughnut

        return new Promise(async (resolve, reject) => {
            try {
                let pending = await db.get().collection(collection.ORDER_COLLECTION).count({ "deliveryDetails.status": "Pending" })

                let placed = await db.get().collection(collection.ORDER_COLLECTION).count({ "deliveryDetails.status": "Placed" })

                let shipped = await db.get().collection(collection.ORDER_COLLECTION).count({ "deliveryDetails.status": "Shipped" })

                let delivered = await db.get().collection(collection.ORDER_COLLECTION).count({ "deliveryDetails.status": "Delivered" })

                doughnut = { placed, pending, shipped, delivered }
                resolve(doughnut)
            } catch (error) {
                reject(error)
            }
        })

    },

    totalOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let total_orders=0
                total_orders = await db.get().collection(collection.ORDER_COLLECTION).count({ "deliveryDetails.status": { $ne: "Pending" } })
                if (total_orders > 0) {
                    resolve(total_orders)
                }else{
                    resolve(0)
                }

            } catch (error) {
                reject(error)
            }
        })
    },


    todayOrders: () => {
        let today = new Date();
        today.setHours(5, 30, 0, 0)
        return new Promise(async (resolve, reject) => {
            try {
                let today_orders=0
                today_orders = await db.get().collection(collection.ORDER_COLLECTION).find({ $and: [{ 'deliveryDetails.date': { $gte: today} }, { "deliveryDetails.status": { $ne: "Pending" } }] }).count(1)
                if (today_orders > 0) {
                    resolve(today_orders)
                }else{
                    resolve(0)
                }

                
            } catch (error) {
                reject(error)
            }
        })
    },


}
