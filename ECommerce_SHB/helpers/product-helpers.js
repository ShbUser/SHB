
const { ObjectId } = require('mongodb')
var db = require('../config/Connection')
var collection = require('../config/collections')
const collections = require('../config/collections')
const { promise } = require('bcrypt/promises')
const { resolve, reject } = require('promise')
const { response } = require('express')
const res = require('express/lib/response')
const { errorFunc } = require('express-fileupload/lib/utilities')
let objectID = require('mongodb').ObjectId



module.exports = {
    addProduct: (Product) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(Product).then((data) => {
                resolve(data.insertedId)
            })
        })

    },    
    getSingleProduct:(proID)=>{
         return new Promise((resolve,reject)=>{         
             db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectID(proID)}).then((product)=>{                 
                 resolve(product) 
             })
         })
     },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            // let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            // resolve(product)
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
                [
                    {
                      $set: {'category': {  '$toObjectId': '$category'   }
                      }
                    },
                    //  {
                    //   $lookup: 
                    //   {
                    //     'from': 'category', 
                    //     'localField': 'category', 
                    //     'foreignField': '_id', 
                    //     'as': 'category'
                    //   }
                    // },
                    
                     // {
                //     $set : {category : {$toObjectId : '$category'}} 
                // },
                {
                    $lookup: {
                        from: collection.CATEGORY_COLLECTION,
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                }
            ]).toArray()
            //  console.log(product);
            resolve(product)
        })
        
       
    },

    getUpdateProduct: (proID) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectID(proID) }).then((product) => {
                resolve(product)
            })
        })
    },
    
    setUpdateProduct: (products, proID) => {
        return new Promise(async (resolve, reject) => {
            
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectID(proID)},           
                {                     
                    $set: {
                        name: products.name,
                        price: products.price,
                        size: products.size,                        
                        category:products.category,
                        qty: products.qty,
                        description: products.description,
                        myimg:products.myimg
                    }
                }).then((response) => {
                    resolve(response)
                })
            })
    },

    deleteProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectID(proId) }).then((response) => {
                resolve(response)
               
            })
        })

    },


    addCategory: (categry) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categry).then((data) => {
                // console.log(categry)
                resolve(data)
            })
        })
    },
    
    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories)
        })
    },

    getUpdateCategory: (catID) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectID(catID) }).then((category) => {
                resolve(category)
            })
        })
    },
    setUpdateCategory: (categ, catID) => {
        return new Promise(async (resolve, reject0) => {
            await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectID(catID) },
                {
                    $set: {
                        name: categ.name,
                        description: categ.description
                    }
                }).then((response) => {
                    resolve(response)
                })
        })

    },
    deleteCategory: (catId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectID(catId) }).then((response) => {
                resolve(response)
            })
        })

    },


    // .....................cart.................................

    getCountCart:(userID)=>{
        return new Promise(async(resolve,reject)=>{
            
            let cart =await db.get().collection(collection.CART_COLLECTION).findOne({user:objectID(userID)})
            if(cart!=null){
            cart=cart.product.length
            
             resolve(cart)
            }else {
                resolve(0)
            }
           
        })
        
    }
    

}