let express = require('express');
const { resolve } = require('promise');
let router = express.Router();
let userHelper = require('../helpers/user-helpers')
let scrpt = require('../public/javascripts/script')

/* GET users listing. */
let user
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/')
  }
}

router.get('/', function (req, res, next) {
  if (req.session.userLoggedIn) {
    user = req.session.user
  }
  res.render('users/home', { title: 'shb', user });
});

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

// router.get('/signup_otp',(req,res)=>{

//   res.render('users/signup_otp')
// })


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
  // progress="50%"
  userHelper.userCheck(req.body).then((response) => {
    if (response.exist) {
      res.render('users/signup', {
         emailErr: "!!!..Entered email allready exist...",name:req.body.name,mobile:req.body.mobile 
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

router.get('/logout', (req, res) => {
  req.session.destroy()
  user = null
  res.redirect('/')
})

module.exports = router;
