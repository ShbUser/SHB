let express = require('express');
let router = express.Router();
let userHelper=require('../helpers/user-helpers')

/* GET users listing. */
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/')
  }
}

router.get('/', function(req, res, next) {
  res.render('users/home', { title: 'shb' });
});



router.post('/signup', (req,res)=>{
  userHelper.doSignUp(req.body).then((response) => {
    // req.session.user = response
    req.session.userLoggedIn = true
    res.redirect('/') 
  })
} )

router.post('/login', (req, res) => {

  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
        req.session.user = response.user
        req.session.userLoggedIn = true

        
        res.render('users/home')
        }
    // else {
    //   req.session.userLoginErr = "Invalid Username or Password"
    //   res.redirect('/')
    // }
  })
})

router.post("/register", async (req, res) => {
  userHelper.userCheck(req.body).then((response)=>{
    if(response.exist){
      res.redirect('/')
    }else{
      userHelper.sendOtp(req.body.mobile).then((data)=>{
        req.session.user = req.body
        req.session.mobile = req.body.mobile
        res.render('users/signup_otp')
      })
    }
  })
});

router.post('/signUpOtpVerify',(req,res)=>{
  userHelper.verifyOtp(req.body,req.session.mobile).then((check)=>{
    if(check === 'approved'){
      userHelper.doSignUp(req.session.user).then((data)=>{
        req.session.loggedIn = true
        res.render('users/home')
      })
    }else{
      res.render('users/signup_Otp')
    }
  })
})

module.exports = router;
