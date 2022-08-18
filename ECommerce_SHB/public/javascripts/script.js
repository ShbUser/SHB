


async function otpVerify() {
    this.document.getElementById('wrong').value = "Please Wait..."
    let otp = document.getElementById('otpID').value
    const res = await axios.post('/signUpOtpVerify', { otp: otp })
        .then((e) => {
            if (e.data.status) {
                location.href = '/'
            } else {
                document.getElementById('wrong').value = "!!! You Entered Wrong OTP"
            }
        })
    }

// async function emailVerify(){
//     alert("ok")
//     // let name=document.getElementById('name').value
//      let email=document.getElementById('email').value
//     // let mobile=document.getElementById('mobile').value
//     // let password=document.getElementById('password').value

//     await axios.post('/',{
//         // name:name,
//          email:email,
//         // mobile:mobile,
//         // password:password
//     }).then((e)=>{
//         if(e.data.status){
//             document.getElementById('emailEr').innerHTML="Error"
//         }
//         else{
//             location.href='users/signup_otp'
//         }

//     })
// }



