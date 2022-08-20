const { response } = require('express');
var express = require('express');
var router = express.Router();
let productHelper = require('../helpers/product-helpers');
const adminHelper = require('../helpers/admin-helpers');
const multer  = require('multer')

const verifyLogin = (req, res, next) => {
    if (req.session.adminLoggedIn) {
        next()
    } else {
        res.redirect('/admin')
    }
}

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
        console.log(products);
        res.render('admin/view_products', { admin: true, products });
    })
})

router.get('/view_users', verifyLogin, (req, res) => {
    adminHelper.getAllUsers().then((users) => {
        res.render('admin/view_users', { admin: true, users })
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

router.get('/delete_products/:id', verifyLogin, (req, res) => {
    productHelper.deleteProduct(req.params.id).then((id) => {
        res.redirect('/admin/view_products')
    })
})

router.get('/edit_products/:id', verifyLogin, (req, res) => {

    productHelper.getCategory().then((category) => {
        productHelper.getUpdateProduct(req.params.id).then((product) => {
            res.render('admin/edit_products', { admin: true, product, category })
        })

    })
})
router.get('/signout', (req, res) => {
    req.session.destroy()
    res.redirect('/admin')
})

router.get('/block-user/:id',(req,res)=>{
        adminHelper.doBlockUser(req.params.id).then((response)=>{
            res.redirect('/admin/view_users')
        })
        
})
router.get('/unblock-user/:id',(req,res)=>{
    adminHelper.doUnBlockUser(req.params.id).then((response)=>{
        res.redirect('/admin/view_users')
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

const storage = multer.diskStorage({
            destination: function (req, file, cb) {
              cb(null, './images/')
            },
            filename: function (req, file, cb) {
              cb(null, Date.now() + '-' + file.originalname)
            },
                   
          })
          const upload = multer({ storage: storage }) 

          function fileUpload(req, res, next) {
            upload.array('files',2);
            console.log(storage.destination);
            next();
          }

  
  
router.post('/add_product', verifyLogin, fileUpload,(req, res) => {
    
    res.redirect('/admin/admin_home')
    // productHelper.addProduct(req.body).then((id) => {
        // let image = req.files.img
        // image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
        //     if (!err)
        //         res.redirect('/admin/view_products')
        //     else console.log(err)
        // })
        
    })
// })

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

router.post('/update_product/:id', verifyLogin, (req, res) => {
    productHelper.setUpdateProduct(req.body, req.params.id).then((response) => {
        res.redirect('/admin/view_products')
        if (req.files.image) {
            let image = req.files.image
            image.mv('./public/product-images/' + req.params.id + '.jpg')
        }
    })
})


module.exports = router;
