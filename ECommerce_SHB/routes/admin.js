const { response } = require('express');
var express = require('express');
var router = express.Router();
let productHelper = require('../helpers/product-helpers')


/* GET home page. */
router.get('/', (req, res) => {
    // productHelper.getCategory().then((response)=>{
    //     console.log(response);
    // res.render('admin/add_products', { admin: true,response })
    //res.render('admin/add_categories', { admin: true })
    productHelper.getAllProducts().then((products) => {
        console.log(products);
        res.render('admin/view_products', { admin: true, products });
    })
})

router.get('/get_products', (req, res) => {
    productHelper.getCategory().then((response) => {
        let cat = response.name
        res.render('admin/add_products', { admin: true, cat })
    })
})

router.get('/get_categories', (req, res) => {

    res.render('admin/add_categories', { admin: true })
})

router.get('/view_products', (req, res) => {

    res.render('admin/view_products', { admin: true })
})

router.get('/view_products', (req, res) => {
    productHelper.getAllProducts().then((products) => {
        console.log(products);
        res.render('admin/view-products', { admin: true, products });
    })
})

router.post('/add-product', (req, res) => {
    productHelper.addProduct(req.body, (id) => {
        let image = req.files.img

        image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
            if (!err)
                res.redirect('/admin')
            else console.log(err)
        })
    })
})


router.post('/add-categories', (req, res) => {
    console.log(req.body);
    productHelper.addCategory(req.body).then((response) => {
        res.redirect('/admin')
    })

})




module.exports = router;
