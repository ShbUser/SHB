const { response } = require('express');
var express = require('express');
var router = express.Router();
let productHelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');


/* GET home page. */
router.get('/', (req, res) => {
    productHelper.getCategory().then((category) => {
        res.render('admin/add_categories', { admin: true, category })
    })
})

router.get('/add_products', (req, res) => {
    productHelper.getCategory().then((category) => {
        res.render('admin/add_categories', { admin: true, category })
    })
})

router.get('/add_categories', (req, res) => {
    productHelper.getCategory().then((category) => {
        res.render('admin/add_categories', { admin: true, category })
    })

})

router.get('/view_products', (req, res) => {
    productHelper.getAllProducts().then((products) => {
        console.log(products);
        res.render('admin/view_products', { admin: true, products });
    })
})

router.get('/view_users', (req, res) => {
    userHelpers.getAllUsers().then((users) => {
        res.render('admin/view_users', { admin: true, users })
    })

})

router.get('/edit_category/:id', (req, res) => {

    productHelper.getUpdateCategory(req.params.id).then((categ) => {
    res.render('admin/edit_categories', { admin: true, categ })

    })
})
router.get('/delete_category/:id', (req, res) => {
    productHelper.deleteCategory(req.params.id).then((id) => {  
    res.redirect('/add_categories')  
    })
  })

router.post('/add-product', (req, res) => {
    productHelper.addProduct(req.body, (id) => {
        let image = req.files.img
        image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
            if (!err)
                res.redirect('/add_products')
            else console.log(err)
        })
    })
})

router.post('/add-categories', (req, res) => {
    console.log(req.body);
    productHelper.addCategory(req.body).then((response) => {
        res.redirect('/add_categories')
    })

})
router.post('/update-categories/:id', (req, res) => {
    productHelper.setUpdateCategory(req.body, req.params.id).then((response)=> {
      res.redirect('/add-categories')
    })
  })
  

module.exports = router;
