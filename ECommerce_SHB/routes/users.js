let express = require('express');
const { resolve, nodeify } = require('promise');
let router = express.Router();
let userHelper = require('../helpers/user-helpers')
let productHelper = require('../helpers/product-helpers');
let adminHelper = require('../helpers/admin-helpers')
let scrpt = require('../public/javascripts/script');
const { response } = require('express');
const { restart } = require('nodemon');
const { redirect } = require('express/lib/response');

const multer = require('multer')
let fs = require('fs');

let user
let getImg
let buynow=false
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
router.get('/', async (req, res, next) => {
  
  let cartCount = 0
  if (req.session.userLoggedIn) {
    user = req.session.user
  }
  await productHelper.getAllProducts().then(async (products) => {
    await adminHelper.getAllBanners().then(async (banner) => {
      if (user) {
        await productHelper.getCountCart(req.session.user._id).then(async (cartcount) => {
          cartCount = cartcount
        }).catch((err) => {
          next(err)
        })
      }
      res.render('users/home', { title: 'shb', user, user_head: true, cartCount, products, banner });

    }).catch((err) => {
      next(err)
    })
  }).catch((err) => {
    next(err)
  })

})


router.get('/home', (req, res) => {
  res.redirect('/')
})

router.get('/login', (req, res, next) => {
  try {
    if (req.session.user) {
      res.redirect('/')
    } else {
      res.render('users/login', { "loginErr": req.session.userLoginErr })
      req.session.userLoginErr = false
    }
  } catch (error) {
    next(error)
  }
})


router.get('/signup', (req, res, next) => {
  try {
    res.render('users/signup', { emailErr: "" })
  } catch (error) {
    next(error)
  }
})

router.get('/view_product/:id', async (req, res, next) => {
  let cartCount = 0
  await productHelper.getSingleProduct(req.params.id).then(async(product) => {
    if (user) {
      await productHelper.getCountCart(req.session.user._id).then((cartcount) => {
        cartCount = cartcount
      }).catch((err) => {
        next(err)
      })
    }
    res.render('users/view_product', { user_head: true, user, product,cartCount })
  }).catch((err) => {
    next(err)
  })
})

router.get('/shop', async (req, res, next) => {
  let cartCount = 0
  await productHelper.getCategory().then(async (category) => {
    await productHelper.getAllProducts().then(async (products) => {
      if (user) {
        await productHelper.getCountCart(req.session.user._id).then((cartcount) => {
          cartCount = cartcount
        }).catch((err) => {
          next(err)
        })
      }
      res.render('users/shop', { user_head: true, cartCount, category, user, products })
    }).catch((err) => {
      next(err)
    })
  }).catch((err) => {
    next(err)
  })
})



router.get('/add-to-cart/:id', verifyLogin, (req, res, next) => {
  userHelper.getUserCart(req.params.id, req.session.user._id).then((cartItems) => {
    res.json({ status: true, user })
  }).catch((err) => {
    next(err)
  })
})
router.get('/wishlist', verifyLogin, async (req, res, next) => {
  let cartCount = 0
  await userHelper.getWishlist(user._id).then(async (products) => {
    if (user) {
      await productHelper.getCountCart(req.session.user._id).then((cartcount) => {
        cartCount = cartcount
      }).catch((err) => {
        next(err)
      })
    }
    res.render('users/wishlist', { user_head: true, cartCount, user, products })
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


router.get('/user_profile', verifyLogin, async (req, res, next) => {
  let cartCount = 0
  await userHelper.getPersonalDetails(user._id).then(async (personalDet) => {
    if (user) {
      await productHelper.getCountCart(req.session.user._id).then((cartcount) => {
        cartCount = cartcount
      }).catch((err) => {
        next(err)
      })
    }
    getImg = personalDet.photo;
    res.render('users/user_profile', { user_head: true, cartCount, user, personalDet })
  }).catch((err) => {
    next(err)
  })
})

router.get('/edit_ship_address/:id', verifyLogin, (req, res, next) => {
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
  if (user) {
    await productHelper.getCountCart(req.session.user._id).then(async (cartCount) => {
      await userHelper.getCartProducts(req.session.user._id).then(async (products) => {
        await adminHelper.getAllCoupens().then(async (coupens) => {
          if (products.length) {
            await userHelper.getTotalAmount(req.session.user._id).then((totalValue) => {
              res.render('users/cart', { user_head: true, products, user, cartCount, coupens, totalValue })
            }).catch((err) => {
              next(err)
            })
          }
          else res.redirect('/shop')
        }).catch((err) => {
          next(err)
        })
      }).catch((err) => {
        next(err)
      })
    }).catch((err) => {
      next(err)
    })
  }
})

router.get('/apply_coupon/:id', verifyLogin, (req, res, next) => {
  let total
  let discount, target
  userHelper.getTotalAmount(user._id).then((totalAmt) => {
    total = parseInt(totalAmt)
    userHelper.isUserValidForCoupen(user._id, req.params.id).then((inValid) => {
      if (inValid) {
        res.json({ inValid: true })
      }
      else {
        userHelper.totalWithCoupen(req.params.id).then((coupen) => {
          discount = parseInt(coupen.coupendiscount)
          target = parseInt(coupen.coupentarget)


          if (total > target) {
            let gt = (total - discount)
            res.json({ status: true, gt: gt, discount: discount, target: target })
          } else
            res.json({ status: false })
        }).catch((err) => {
          next(err)
        })
      }
    }).catch((err) => {
      next(err)
    })


  }).catch((err) => {
    next(err)

  })
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


router.get('/invoice/:id', verifyLogin, async (req, res, next) => {
  await userHelper.getrOrderProducts(req.params.id).then(async(products) => {
  await userHelper.getSingleOrder(req.params.id).then((order) => {
   
    res.render('users/invoice',{user_head:true, order,products})
  }).catch((err) => {
    next(err)
  })
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

router.post('/search_product', async (req, res, next) => {
  let cartCount = 0
  await productHelper.getCategory().then(async (category) => {
    await productHelper.getProductByCategory(req.body.category).then(async (products) => {
      if (user) {
        await productHelper.getCountCart(req.session.user._id).then((cartcount) => {
          cartCount = cartcount
        }).catch((err) => {
          next(err)
        })
      }
      //console.log(products,">>>>>>>>>>>>>>>>>>>");
      res.render('users/shop', { user_head: true, cartCount, category, user, products })
    }).catch((err) => {
      next(err)
    })
  }).catch((err) => {
    next(err)
  })

  // res.render('users/shop', { user_head: true, cartCount, category, user, products })
  // console.log(products,"ppppppppppppppppp");
  //   res.send({payload:products})
  // let payload=req.body.payload.trim() 


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
  //if(req.file === undefined) req.file.filename=getImg
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
  userHelper.addEditShippingAddress(req.body, user._id).then((response) => {
    // res.json({ status: true })
    res.redirect('/user_profile')
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
  userHelper.setProQuantity(req.body).then(async (response) => {
    await userHelper.getTotalAmount(req.session.user._id).then((total) => {

      res.json({ status: true, response, total: total })
    })

  }).catch((err) => {
    next(err)
  })

})

router.get('/buy_now/:id', verifyLogin, async (req, res, next) => {
  let total,id
    await productHelper.getSingleProduct(req.params.id).then(async (product) => {
      total=product.price
      id=product._id
    await userHelper.getAddressFromOrderList(user._id).then(async (address) => {
      await userHelper.getAllShipAddress(user._id).then((shipAddressList) => {
        buynow=true
        res.render('users/place_order', { user_head: true, user,total ,id, address, shipAddressList })
      }).catch((err) => {
        next(err)
      })
    }).catch((err) => {
      next(err)
    })

  }).catch((err) => {
    next(err)
  })
})



router.post('/place_order', verifyLogin, async (req, res, next) => {
  buynow=false
  await userHelper.getTotalAmount(req.session.user._id).then(async (total) => {
    if (total != 0) {
      await userHelper.totalWithCoupen(req.body.coupon).then(async (coupen) => {
        await userHelper.getAddressFromOrderList(user._id).then(async (address) => {
          await userHelper.getAllShipAddress(user._id).then((shipAddressList) => {

            if (coupen != 0) {
              total = (parseInt(total) - parseInt(coupen.coupendiscount))
            }
            res.render('users/place_order', { user_head: true, user, total, address, coupen, shipAddressList })
          }).catch((err) => {
            next(err)
          })

        }).catch((err) => {
          next(err)
        })

      }).catch((err) => {
        next(err)
      })
    } else {
      res.redirect('/shop')
    }
  }).catch((err) => {
    next(err)
  })

})


//....................................COD or ONLINE payment.........................................

router.post('/checkout', async (req, res, next) => {
  let totalPrice = 0
  let products=[]
  // products = 0
  if(buynow){
    await productHelper.getSingleProduct(req.body.proid).then(async (product) => {
        products[0]={item:product._id,quantity:1}
        totalPrice=product.price
          userHelper.placeOrder(user._id, req.body, products, totalPrice).then((orderID) => {
            buynow=false
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
      
    }).catch((err) => {
      next(err)
    })

  }
  else{
  await userHelper.getCartProductList(user._id).then(async (products) => {
    await userHelper.getTotalAmount(user._id).then(async (totalPrice) => {
      await userHelper.totalWithCoupen(req.body.coupencode).then((coupen) => {
        if (coupen != 0) {
          totalPrice = (parseInt(totalPrice) - parseInt(coupen.coupendiscount))
        }
        userHelper.placeOrder(user._id, req.body, products, totalPrice).then((orderID) => {
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

      }).catch((err) => {
        next(err)
      })

    }).catch((err) => {
      next(err)
    })
  }).catch((err) => {
    next(err)
  })
}

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
  getImg=null
  buynow=false
  res.redirect('/')
})



module.exports = router;
