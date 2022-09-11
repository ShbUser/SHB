let express = require('express');
const { resolve, nodeify } = require('promise');
let router = express.Router();
let userHelper = require('../helpers/user-helpers')
let productHelper = require('../helpers/product-helpers');
let scrpt = require('../public/javascripts/script');
const { response } = require('express');
const { restart } = require('nodemon');
const { redirect } = require('express/lib/response');

const multer = require('multer')
let fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/product-images')
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1]

    cb(null, `images-${file.fieldname}-${Date.now()}.${ext}`)
  },

})
const upload = multer({ storage: storage })

/* GET users listing. */
let user
let getImg
const verifyLogin = (req, res, next) => {

  if (req.session.userLoggedIn) {
    userHelper.isBlock(user._id).then((response) => {
      if (response.status) {
        // scrpt.isBlock()          
        res.render('users/user_blocked', { user_head: true, user })
        req.session.destroy()
        user = null

      } else { next() }
    })

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
    res.render('users/home', { title: 'shb', user, user_head: true, products });

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

router.get('/view_product/:id', (req, res, next) => {
  productHelper.getSingleProduct(req.params.id).then((product) => {
    res.render('users/view_product', { user_head: true, user, product })
  }).catch((err) => {
    next(err)
  })

})
router.get('/shop', (req, res) => {
  productHelper.getAllProducts().then((products) => {
    res.render('users/shop', { user_head: true, user, products })
  })
})


router.get('/add-to-cart/:id', verifyLogin, (req, res, next) => {
  userHelper.getUserCart(req.params.id, req.session.user._id).then((cartItems) => {
    res.json({ status: true, user })
  }).catch((err) => {
    next(err)
  })
})
router.get('/wishlist', verifyLogin, (req, res, next) => {
  userHelper.getWishlist(user._id).then((products) => {
    res.render('users/wishlist', { user_head: true, user, products })
  }).catch((err) => {
    next(err)
  })

})

router.get('/add_to_wishlist/:id', verifyLogin, (req, res, next) => {
  userHelper.addToWishlist(req.params.id, req.session.user._id).then((wishItem) => {
    if (wishItem == -1) {
      res.json({ status: true })
    } else {
      res.json({ status: false, user })
    }

  }).catch((err) => {
    next(err)
  })
})

router.get('/del-wish-item/:id', verifyLogin, (req, res, next) => {
  userHelper.deleteWishItem(req.params.id, user._id).then(async (response) => {
    if (response.deletedCount != 0)
      res.json({ status: true })
    else
      res.json({ status: false })

  }).then((err) => {
    next(err)

  })
})


router.get('/user_profile', verifyLogin, (req, res, next) => {
  userHelper.getPersonalDetails(user._id).then((personalDet) => {
    // console.log(personalDet);
    getImg = personalDet.photo;
    res.render('users/user_profile', { user_head: true, user, personalDet })
  }).catch((err) => {
    next(err)
  })
})

router.get('/edit_ship_address/:id',verifyLogin, (req, res, next) => {
  userHelper.getShipAddress(user._id, req.params.id).then((shipAddress) => {
    res.json({ status: true, shipAddress: shipAddress })
    // console.log(shipAddress);
  }).catch((err) => {
    next(err)
  })
})

router.get('/del-ship-address/:id', verifyLogin, (req, res, next) => {
  userHelper.deleteShipAddress(req.params.id, user._id).then((response) => {
    if (response.deletedCount != 0)
      res.json({ status: true })
    else
      res.json({ status: false })

  }).then((err) => {
    next(err)

  })
})

router.get('/cart', verifyLogin, async (req, res, next) => {
  // let user = req.session.user
  // let cartCount = 0, totalValue = 0

  if (user) {
    await productHelper.getCountCart(req.session.user._id).then(async (cartCount) => {
      await userHelper.getCartProducts(req.session.user._id).then(async (products) => {
        if (products.length) {
          await userHelper.getTotalAmount(req.session.user._id).then((totalValue) => {
            res.render('users/cart', { user_head: true, products, user, cartCount, totalValue })
          }).catch((err) => {
            next(err)
          })
        }
        else res.redirect('/')
      }).catch((err) => {
        next(err)
      })
    }).catch((err) => {
      next(err)
    })
  }

  // console.log(products);


})

router.get('/del-cart-item/:id', verifyLogin, (req, res, next) => {
  userHelper.deleteCartItem(req.session.user._id, req.params.id).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.session.user._id)
    res.json({ status: true, total: response.total })
  }).catch((err) => {
    next(err)
  })
})

router.get('/del-order-item/:id', verifyLogin, (req, res, next) => {
  userHelper.deleteOrderItem(req.params.id).then(async (response) => {
    if (response.deletedCount != 0)
      res.json({ status: true })
    else
      res.json({ status: false })

  }).then((err) => {
    next(err)

  })
})


router.get('/place_order', verifyLogin, async (req, res) => {
  await userHelper.getTotalAmount(req.session.user._id).then(async (total) => {
    await userHelper.getAddressFromOrderList(user._id).then(async (address) => {
      await userHelper.getAllShipAddress(user._id).then((shipAddressList) => {
        res.render('users/place_order', { user_head: true,user, total, address ,shipAddressList})
      }).catch((err) => {
        next(err)
      })

    }).catch((err) => {
      next(err)
    })
  }).catch((err)=>{
    next(err)
  })
})


router.get('/order', verifyLogin, async (req, res, next) => {
  await userHelper.getOrder(req.session.user._id).then((order) => {
    res.render('users/order', { user_head: true, user, order })
  }).catch((err) => {
    next(err)
  })
  //console.log(order)

})

router.get('/view_order_products/:id', verifyLogin, async (req, res, next) => {
  await userHelper.getrOrderProducts(req.params.id).then((products) => {
    res.render('users/view_order_products', { user_head: true, user, products })
  }).catch((err) => {
    next(err)
  })


})
// ................................post methods.................................................

router.post('/signup', (req, res, next) => {
  userHelper.doSignUp(req.body).then((response) => {
    req.session.userLoggedIn = true
    res.redirect('/')
  }).catch((err) => {
    next(err)
  })
})

router.post('/login', (req, res, next) => {

  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userLoggedIn = true
      user = req.session.user
      res.redirect('/')
    }
    else {
      req.session.userLoginErr = "!!! You entered invalid Username or Password"
      res.redirect('/login')
    }
  }).catch((err) => {
    next(err)
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


router.post('/register', (req, res, next) => {
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
      }).catch((err) => {
        next(err)
      })
    }
  }).catch((err) => {
    next(err)
  })
})

router.post('/signUpOtpVerify', (req, res, next) => {
  let response = {}
  userHelper.verifyOtp(req.body, req.session.user.mobile).then((check) => {
    if (check === 'approved') {
      req.session.user.isBlock = false
      userHelper.doSignUp(req.session.user).then((data) => {
        user = req.session.user
        req.session.userLoggedIn = true
        response.status = true
        res.json({ status: true })
      }).catch((err) => {
        next(err)
      })
    } else {
      response.status = false
      res.json({ status: false })
    }


  }).catch((err) => {
    next(err)
  })
})
router.post('/add_personalDet/:id', verifyLogin, (req, res, next) => {

  userHelper.addPersonalDetails(req.body, req.params.id).then((response) => {
    res.redirect('/user_profile')
    // res.json({status:true})
  }).catch((err) => {
    next(err)
  })
})
router.post('/updateProfilePic/:id', verifyLogin, upload.single('img'), (req, res, next) => {
  userHelper.setProfilepiC(req.file.filename, user._id).then((response) => {
    req.session.user.photo = req.file.filename
    user.photo = req.file.filename
    if (getImg != null) {
      fs.unlink("./public/product-images/" + getImg, (err) => {
        if (err) {
          throw err;
        }
      })
    }
    res.redirect('/user_profile')
  }).catch((err) => {
    next(err)
  })
})

router.post('/add_shipping_address', (req, res, next) => {
  userHelper.addShippingAddress(req.body, user._id).then((response) => {
    res.json({ status: true })
  }).catch((err) => {
    next(err)
  })

})
router.post('/edit_shipping_address/:id', (req, res, next) => {
  userHelper.editShippingAddress(req.body, user._id, req.params.id).then((response) => {
    res.json({ status: true })
  }).catch((err) => {
    next(err)
  })

})

router.post('/edit_password/:id', (req, res) => {
  userHelper.changePassword(req.body, req.params.id).then((response) => {
    console.log(response);
    if (response.status) {
      res.json({ status: true })
      req.session.destroy()
      user = null
    }
    else {
      res.json({ status: false })
    }
  }).catch((err) => {
    next(err)
  })

})

router.post('/set-quantity', verifyLogin, (req, res, next) => {

  userHelper.setProQuantity(req.session.user._id, req.body).then(async (response) => {

    response.total = await userHelper.getTotalAmount(req.session.user._id)
    res.json({ status: true, total: response.total })
  }).catch((err) => {
    next(err)
  })

})

//....................................COD or ONLINE payment.........................................

router.post('/checkout', async (req, res, next) => {
  let totalPrice = 0, products = 0
  products = await userHelper.getCartProductList(req.body.userId)
  totalPrice = await userHelper.getTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body, products, totalPrice).then((orderID) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
       res.redirect('/order')
    }
    else {

      userHelper.generateRazorPay(orderID, totalPrice).then((response) => {
        res.json(response)
      }).catch((err) => {
        next(err)
      })

    }
  }).catch((err) => {
    next(err)
  })
})


router.post('/verify-payment', (req, res) => {
  console.log(req.body)
  userHelper.verifyPayment(req.body).then(() => {

    userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("Payment successfull");
      res.json({ status: true })

    }).catch((err) => {
      next(err)
      res.json({ status: false, errMsg: '' })
    })

  }).catch((err) => {
    next(err)
  })
})
//.....................................................................................
router.get('/logout', (req, res) => {
  req.session.destroy()
  user = null
  res.redirect('/')
})



module.exports = router;
