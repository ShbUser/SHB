const { response } = require('express');
var express = require('express');
var router = express.Router();
let productHelper = require('../helpers/product-helpers');
let userHelper = require('../helpers/user-helpers')
const adminHelper = require('../helpers/admin-helpers');

const multer = require('multer')
let fs = require('fs');
const { resolve } = require('path');
const { reject } = require('promise');

let imgArr = []
let edit_Banner_ID, banner_img

const verifyLogin = (req, res, next) => {
    if (req.session.adminLoggedIn) {
        next()
    } else {
        res.redirect('/admin')
    }
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/product-images')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split("/")[1]

        cb(null, `images-${file.fieldname}-${Date.now()}.${ext}`)
    },

})

//test....
const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/banner-images')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split("/")[1]

        cb(null, `images-${file.fieldname}-${Date.now()}.${ext}`)
    }

})
//end  .....
const upload = multer({ storage: storage })
let upload1 = multer({ storage: storage1 })
// ................................. GET methods................................................

router.get('/', (req, res) => {
    res.render('admin/log_in_ad', { "loginErr": req.session.adminLoginErr })
})
router.get('/admin_home', verifyLogin, (req, res) => {
    res.render('admin/admin_home', { admin: true })
})


router.get('/add_products', verifyLogin, (req, res) => {
    productHelper.getCategory().then((category) => {
        // console.log(category);
        res.render('admin/add_products', { admin: true, category })
    })
})

router.get('/add_categories', verifyLogin, (req, res) => {
    productHelper.getCategory().then((category) => {
        res.render('admin/add_categories', { admin: true, category })
    })
})

router.get('/view_products', verifyLogin, (req, res) => {
    productHelper.getAllProducts().then((products) => {
        //    productHelper.getUpdateCategory(products[0].category).then((category)=>{
        // if(category!=undefined){
        // products[0].categoryName=category.name
        // }
        res.render('admin/view_products', { admin: true, products });
    })

})

router.get('/status_Shipped/:id', verifyLogin, async (req, res, next) => {
    await adminHelper.updateStatusShipped(req.params.id).then((response) => {
        // res.redirect('/admin/view_orders')
        res.json({ status: true })
    }).catch((err) => {
        next(err)
    })
})

router.get('/status_Delivered/:id', verifyLogin, async (req, res, next) => {
    await adminHelper.updateStatusDelivered(req.params.id).then((response) => {
        res.json({ status: true })
    }).catch((err) => {
        next(err)
    })
})

router.get('/view_orders', verifyLogin, (req, res, next) => {
    adminHelper.getAllOrderList().then((orders) => {
        res.render('admin/view_orders', { admin: true, orders })
    }).catch((err) => {
        next(err)
    })
})

router.get('/admin_view_order_products/:id', verifyLogin, async (req, res, next) => {
    await userHelper.getrOrderProducts(req.params.id).then((products) => {
        res.render('admin/admin_view_order_products', { admin: true, products })
    }).catch((err) => {
        next(err)
    })
})

router.get('/view_users', verifyLogin, (req, res) => {
    adminHelper.getAllUsers().then((users) => {
        res.render('admin/view_users', { admin: true, users })
    })
})

router.get('/banner_manage', verifyLogin, (req, res, next) => {
    adminHelper.getAllBanners().then((banners) => {
        res.render('admin/banner_manage', { admin: true, banners })
    }).catch((err) => {
        next(err)
    })
})


router.get('/edit_category/:id', verifyLogin, (req, res) => {

    productHelper.getUpdateCategory(req.params.id).then((categ) => {
        res.render('admin/edit_categories', { admin: true, categ })

    })
})
router.get('/delete_category/:id', verifyLogin, (req, res) => {
    productHelper.deleteCategory(req.params.id).then((id) => {
        res.redirect('/admin/add_categories')
    })
})

router.get('/delete_products/:id/:imgs', verifyLogin, (req, res) => {
    productHelper.deleteProduct(req.params.id).then((id) => {

        imgArr = req.params.imgs.split(",")
        imgArr.forEach(element => {
            fs.unlink("./public/product-images/" + element, (err) => {
                if (err) {
                    throw err;
                }
            })
        });
        res.redirect('/admin/view_products')
    })
})

router.get('/edit_products/:id', verifyLogin, (req, res) => {

    productHelper.getCategory().then((categories) => {
        productHelper.getUpdateProduct(req.params.id).then((product) => {

            //..................Storing edit images to imgArr[]......................
            imgArr = product.myimg
            productHelper.getUpdateCategory(product.category).then((category) => {
                res.render('admin/edit_products', { admin: true, categories, product, category })
            })

        })

    })
})
router.get('/signout', (req, res) => {
    req.session.destroy()
    res.redirect('/admin')
})

router.get('/block-user/:id', verifyLogin, (req, res) => {
    adminHelper.doBlockUser(req.params.id).then((response) => {
        res.redirect('/admin/view_users')
    })

})
router.get('/unblock-user/:id', verifyLogin, (req, res) => {
    adminHelper.doUnBlockUser(req.params.id).then((response) => {
        res.redirect('/admin/view_users')
    })

})

router.get('/get_edit_banner/:id', (req, res) => {
    adminHelper.getEditBanner(req.params.id).then((banner) => {
       imgArr = banner.bannerImg
        edit_Banner_ID = banner._id
        res.json({ status: true, banner: banner })
    })
})


// .........................................Post methods..........................................................

router.post('/log_in_ad', (req, res) => {

    adminHelper.doLogin_admin(req.body).then((response) => {
        if (response.status) {
            req.session.admin = response.admin
            req.session.adminLoggedIn = true
            res.redirect('/admin/admin_home')
        }
        else {
            req.session.adminLoginErr = "!!! You entered invalid Username or Password"
            res.redirect('/admin')
        }
    })

})



// function fileUpload(req, res, next) {
//     upload.array('files', 2);
//     console.log(storage.destination);
//     next();
// }



router.post('/add_product', verifyLogin, upload.array('img', 5), (req, res, next) => {
    const images = req.files
    let array = []
    array = images.map((value) => value.filename)
    req.body.myimg = array

    productHelper.addProduct(req.body).then((id) => {
        res.redirect('/admin/view_products')
    }).catch((err) => {
        next(err)
    })
})

router.post('/add-categories', verifyLogin, (req, res) => {
    productHelper.addCategory(req.body).then((response) => {
        res.redirect('/admin/add_categories')
    })
})

router.post('/update-categories/:id', verifyLogin, (req, res) => {
    productHelper.setUpdateCategory(req.body, req.params.id).then((response) => {
        res.redirect('/admin/add_categories')
    })
})


router.post('/update_product/:id', verifyLogin, upload.array('img', 3), (req, res) => {
    if (req.files == "") {
        req.body.myimg = imgArr
    }
    else {
        const images = req.files
        let array = []
        array = images.map((value) => value.filename)
        req.body.myimg = array

        imgArr.forEach(element => {
            fs.unlink("./public/product-images/" + element, (err) => {
                if (err) {
                    throw err;
                }
            })
        });
        imgArr = []
    }
    productHelper.setUpdateProduct(req.body, req.params.id).then((response) => {
        imgArr = ""
        res.redirect('/admin/view_products')
        // if (req.files.image) {
        //     let image = req.files.image
        //     image.mv('./public/product-images/' + req.params.id + '.jpg')
        // }
    })
})

router.post('/add_banner', verifyLogin, upload1.array('img',3), (req, res, next) => {
    // req.body.bannerImg = req.file.filename
    const images = req.files
    let array = []
    array = images.map((value) => value.filename)
    req.body.bannerImg = array
    adminHelper.addBanner(req.body).then((id) => {
        res.redirect('/admin/banner_manage')
    }).catch((err) => {
        next(err)
    })
})


router.post('/edit_banner', verifyLogin, upload1.array('img',3), (req, res) => {
    if (req.files == "") {
        req.body.myimg = imgArr
    }
    else {
        const images = req.files
        let array = []
        array = images.map((value) => value.filename)
        req.body.myimg = array

        imgArr.forEach(element => {
            fs.unlink("./public/banner-images/" + element, (err) => {
                if (err) {
                    throw err;
                }
            })
        });
        imgArr = []
    }
    // if (req.file ==null) {
    //     req.body.bannerImg = banner_img
    // }
    // else {
    //     req.body.bannerImg = req.file.filename
    //     fs.unlink("./public/banner-images/" + banner_img, (err) => {
    //         if (err) {
    //             throw (err)
    //         }
    //     })
    // }
    adminHelper.editBanner(edit_Banner_ID, req.body).then((response) => {

        banner_img = ""
        edit_Banner_ID = ""
        res.redirect('/admin/banner_manage')
    }).catch((err) => {
        next(err)
    })
})

module.exports = router;
