var express = require('express');
var router = express.Router();
let productHelper = require('../helpers/product-helpers')


/* GET home page. */

router.get('/', (req, res) => {
    res.render('admin/admin_home',{admin:true})
})
router.get('/add_products', (req, res) => {
    res.render('admin/add_products')
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

module.exports = router;
