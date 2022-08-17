

async function otpVerify(){
    document.getElementById('wrong').value="Please Wait..."
    let otp =  document.getElementById('otpID').value
    const res = await axios.post('/signUpOtpVerify',{otp:otp})
    .then((e)=>{
        if(e.data.status){
            location.href='/'
        }else{
            document.getElementById('wrong').value="!!! You Entered Wrong OTP"
        }
    })
}
function allLetter()
  {
//    var letters = /^[A-Za-z]+$/;
//    if(document.getElementById('inputtxt').value.match(letters))
//      {
//       return true;
//      }
//    else
//      {
     alert("message");
    //  return false;
    //  }
  }
