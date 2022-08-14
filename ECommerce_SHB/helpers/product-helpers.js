
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
    addProduct: (Product, callback) => {

        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(Product).then((data) => {
            callback(data.insertedId)

        })
    },

    addCategory: (categry) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categry).then((data) => {
                console.log(categry)
                resolve(data)
            })
        })
    },
    getCategory: () => {
        return new Promise(async(resolve, reject) => {
            let categories=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories )
        })            
    },

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
           let product= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
           
           resolve(product)
        })
    },
    getUpdateCategory: (catID)=>{
         return new Promise(async(resolve,reject)=>{         
             await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectID(catID)}).then((category)=>{                 
                 resolve(category)
             })
         })
     },
     setUpdateCategory:(categ,catID)=>{
        return new Promise(async(resolve,reject0)=>{
           await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectID(catID)},
            {$set:{
                name:categ.name,
                description:categ.description    
            }
            }).then((response)=>{
                resolve(response)
            })
            
        })
        
    },
    deleteCategory:(catId)=>{
        return new Promise(async(resolve,reject)=>{
             await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectID(catId)}).then((response)=>{
                resolve(response)
             })
         })
 
     },
}