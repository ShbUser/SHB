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
                console.log(bannerDet, ".................");
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
                            coupentarget:coupenDet.coupentarget
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
    getRevenue: () => {
        //let before_date= new Date().getFullYear()
        //console.log(before_date); {createdAt:{$gte:ISODate(“2020-03-01”),$lt:ISODate(“2021-03-31”)}}
        return new Promise(async (resolve, reject) => {
            try {
            //   let revenue=  await db.get().collection(collection.ORDER_COLLECTION).find().sort({ 'deliveryDetails.date': -1 }).limit(5).toArray()
            //   let date=revenue[0].deliveryDetails.date.toDateString()           
              
            //                 console.log(date.slice(4),"nnnnnnnnnnnnnnnnnnnnn");

                            let details= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                // {
                                //     $project:{_id:0,month:{$month:"$deliveryDetails.date"}}
                                // },
                                
                                {
                                    $group:{_id:null,
                                        total:{$sum:"$totalAmount"}}
                                    
                                }
                                // {
                                //         $project:{"deliveryDetails.name":1}
                                // }
                            ]).toArray()
                       
                console.log(details);
                resolve(details)
            } catch (error) {
                reject(error)
            }
        })
    },


}
