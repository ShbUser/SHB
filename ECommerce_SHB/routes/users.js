let express = require('express');
const { resolve } = require('promise');
let router = express.Router();
let userHelper = require('../helpers/user-helpers')
let productHelper = require('../helpers/product-helpers');
let scrpt = require('../public/javascripts/script');
const { response } = require('express');
const { restart } = require('nodemon');
const { redirect } = require('express/lib/response');

/* GET users listing. */
let user
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    user=req.session.user
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/', function (req, res, next) {
      // res.render('users/place_order',{user_head:true})

  if (req.session.userLoggedIn) {
    user = req.session.user
  }

  productHelper.getAllProducts().then((products) => {

    res.render('users/home', { title: 'shb', user_head: true, user, products });

  })

});
router.get('/home', (req, res) => {
  res.redirect('/')
})

router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('users/login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false
  }
})

router.get('/signup', (req, res) => {

  res.render('users/signup', { emailErr: "" })
})

router.get('/view_product/:id', (req, res) => {
  productHelper.getSingleProduct(req.params.id).then((product) => {
    res.render('users/view_product', { user_head: true , user, product})
  })

})
router.get('/shop',(req,res)=>{
    productHelper.getAllProducts().then((products) => {
         res.render('users/shop',{user_head:true, user, products})
    })
})


router.get('/add-to-cart/:id', verifyLogin, (req, res) => {
  userHelper.getUserCart(req.params.id, req.session.user._id).then((cartItems) => {
    res.json({ status: true })
  })
})


router.get('/cart', verifyLogin, async (req, res) => {
  // let user = req.session.user
  let cartCount = 0, totalValue=0
  if (user) {    
   cartCount = await productHelper.getCountCart(req.session.user._id)
  }
    let products = await userHelper.getCartProducts(req.session.user._id)
    console.log(products);
    if (products.length) {
    totalValue = await userHelper.getTotalAmount(req.session.user._id)
    res.render('users/cart', { user_head: true, products, user, cartCount, totalValue })
     }
    else res.redirect('/')
  
})

router.get('/del-cart-item/:id', verifyLogin, (req, res) => {
  userHelper.deleteCartItem(req.session.user._id, req.params.id).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.session.user._id)
    res.json({ status: true, total: response.total })
  })
})

router.get('/place_order', verifyLogin, async (req, res) => {
  let total = await userHelper.getTotalAmount(req.session.user._id)
  res.render('users/place_order', { user_head:true, total, user })
})

router.get('/order_placed',verifyLogin,(req,res)=>{
    res.render('users/order_placed',{user_head:true})
})



// ................................post methods.................................................

router.post('/signup', (req, res) => {
  userHelper.doSignUp(req.body).then((response) => {
    req.session.userLoggedIn = true
    res.redirect('/')
  })
})

router.post('/login', (req, res) => {

  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    }
    else {
      req.session.userLoginErr = "!!! You entered invalid Username or Password"
      res.redirect('/login')
    }
  })

})


// router.post("/email_Verification", async (req, res) => {

//   userHelper.userCheck(req.body).then((response) => {
//     if (response.exist) {
//       response.status=true
//       res.json({status :true})
//     }
//     else{
//       response.status=
//       res.json({status :false})
//     }
//   })
// })


router.post('/register', (req, res) => {
  userHelper.userCheck(req.body).then((response) => {
    if (response.exist) {
      res.render('users/signup', {
        emailErr: "!!!..Entered email allready exist...", name: req.body.name, mobile: req.body.mobile
      })
    }
    else {
      userHelper.sendOtp(req.body.mobile).then((response) => {
        req.session.user = req.body
        res.render('users/signup_otp')
      })
    }
  })
})

router.post('/signUpOtpVerify', (req, res) => {
  let response = {}
  userHelper.verifyOtp(req.body, req.session.user.mobile).then((check) => {
    if (check === 'approved') {
      req.session.user.isBlock = false
      userHelper.doSignUp(req.session.user).then((data) => {
        user = req.session.user
        req.session.userLoggedIn = true
        response.status = true
        res.json({ status: true })
      })
    } else {
      response.status = false
      res.json({ status: false })
    }


  })
})

router.post('/set-quantity',verifyLogin, (req, res, next) => {

  userHelper.setProQuantity(req.session.user._id, req.body).then(async (response) => {

    response.total = await userHelper.getTotalAmount(req.session.user._id)
    res.json({ status: true, total: response.total })
  })

})


router.get('/logout', (req, res) => {
  req.session.destroy()
  user = null
  res.redirect('/')
})

module.exports = router;
