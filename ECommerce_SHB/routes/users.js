let express = require('express');
let router = express.Router();
let userHelper=require('../helpers/user-helpers')

/* GET users listing. */
let user
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/')
  }
}

router.get('/', function(req, res, next) {  
  if(req.session.userLoggedIn){
    user=req.session.user
  }
  res.render('users/home', { title: 'shb',user});
});

router.get('/login',(req,res)=>{
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('users/login', { "loginErr": req.session.userLoginErr})
    req.session.userLoginErr = false
  }
})

router.get('/signup',(req,res)=>{
  res.render('users/signup')
})

router.post('/signup', (req,res)=>{
  userHelper.doSignUp(req.body).then((response) => {
    req.session.userLoggedIn = true
    res.redirect('/') 
  })
} )

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
        user=req.session.user
        req.session.userLoggedIn = true
        res.redirect('/')
      })
    }else{
      res.render('users/signup_Otp')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy() 
  user=null  
  res.redirect('/')
})

module.exports = router;
