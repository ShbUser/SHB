
async function otpVerify() {

    this.document.getElementById('wrong').value = "Please Wait..."
    let otp = document.getElementById('otpID').value
   
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
                // alert("Item added to cart")
                swal("Item Added to your cart","", "success");
                if(isNaN(document.getElementById('cart-count').value)){ document.getElementById('cart-count').innerHTML=0 }
                let count = document.getElementById('cart-count').innerHTML
                count = parseInt(count) + 1                
                document.getElementById('cart-count').value=1;
                document.getElementById('cart-count').innerHTML=count
                // alert(document.getElementById('cart-count').innerHTML)
                 }
                 else{
                    location.href='/login'
                 }
    })
}

async function addToWishlist(proID) {
    await axios.get('/add_to_wishlist/'+proID).then((e)=>{
        if (e.data.status)
            {                 
               swal("Item Added to your wishlist","", "success");
            }else{
                swal("Item Exist","",  {
                    icon: "warning",
                  });
                //location.href('/login')  
             }
      })
  }

//   async function addPersonalDetails(userID) {
//     await axios.get('/add_personalDet/'+userID,{

//     }).then((e)=>{
//         if (e.data.status)
//             {                 
//                swal("Saved your personal details","", "success");
//             }
//       })
//   }

async function setToCount(proid) {    
    qty = document.getElementById(proid).value    
    await axios.post('/set-quantity', { prod: proid,  qt: qty }).then((e)=>{
            if(e.data.status){       
                 swal("Quantity updated", "", "success");     
                document.getElementById('total-price').innerHTML=e.data.total               
            }
    })
}

async function delCartItem(prodID,obj) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then(async(willDelete) => {
        if (willDelete) {
            await axios.get('/del-cart-item/'+prodID).then((e)=>{
                if (e.data.status) {
                    
                    swal("Item deleted", "", "success");
                    document.getElementById('total-price').innerHTML=e.data.total
                    $(obj).closest('tr').remove()
                }
            })  
        } else {
          swal("Your imaginary file is safe!");
        }
      })

}   

async function statusShipped(orderID,obj) {
    await axios.get('/admin/status_Shipped/'+orderID).then((e)=>{
        if (e.data.status) {           
            swal("Item shipped","", "success");
            location.href='/admin/view_orders'
            // document.getElementById('status').innerHTML="Shipped"
            // $(obj).getElementById('status').innerHTML="Shipped"
        }
    })    
}

async function statusDelivered(orderID,obj) {
    await axios.get('/admin/status_Delivered/'+orderID).then((e)=>{
        if (e.data.status) {
            
            swal("Item Delivered", "", "success");
            location.href='/admin/view_orders'
            // document.getElementById('status').innerHTML="Delivered"
            // $(obj).getElementById('status').innerHTML="Delivered"
            
        }
    })    
}


  function delOrderItems(prodID,obj) {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this imaginary file!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then(async(willDelete) => {
        if (willDelete) {
            await axios.get('/del-order-item/'+prodID).then((e)=>{
                if (e.data.status) {
                    
                    swal("Order Cancelled", "", "success");
                    $(obj).closest('tr').remove()
                    // document.getElementById('total-price').innerHTML=e.data.total
                }
                else{
                    swal("Can't delete Shipped order", "", "success");
                    // location.href='/order'
                }
            })
        } else {
          swal("Your imaginary file is safe!");
        }
      });


    
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



