const { response } = require("express")




async function otpVerify() {

    this.document.getElementById('wrong').value = "Please Wait..."
    let otp = document.getElementById('otpID').value
    alert(":vrfy")
    await axios.post('/signUpOtpVerify', { otp: otp }) 
        .then((e) => {
            if (e.data.status) {
                location.href = '/'
            } else {
                document.getElementById('wrong').value = "!!! You Entered Wrong OTP"
            }
        })
}

async function addToCart(proID) {
  await axios.get('/add-to-cart/'+proID).then((e)=>{
                if (e.data.status)
                 {
                alert("Item added")              
                let count = document.getElementById('cart-count').value
                count = parseInt(count) + 1
                document.getElementById('cart-count').value=count
                 }
    })
}



// module.exports={
//    emailVerify:async()=> {
//     let email = document.getElementById('emailfield').value
//     await axios.post('/email_Verification', {
//         email: email
//     }).then((e) => {
//         if (e.data.status) {
//             emailErr=true
//             document.getElementById('emailEr').innerHTML = "!!!..Entered email allready exist..."
        
//         }
//         return true
//         // else {
//         //     register()
//         // }
//     })
// }
// }
// async function register() {

//     document.getElementById('emailEr').innerHTML =""   
//     let name = document.getElementById('namefield').value 
//     let email = document.getElementById('emailfield').value
//     let mobile = document.getElementById('mobilefield').value    
//     let password = document.getElementById('passwordfield').value
//     await axios.post('/register', {    
          
//         name: name,
//         email: email,
//         mobile: mobile,
//         password: password
        
//     }).then((e) => {
//         if (e.data.status) {
//             alert("ok")
//             location.href = '/signup_otp'
//         }

//      })
// }



