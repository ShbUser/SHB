
async function isBlock(){
    await swal("Your account blocked.","Cnontact customer service",{icon:"danger"})
}

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
async function editPassword(userID){
    password=document.getElementById('password').value
    newpassword=document.getElementById('newpassword').value
    if(password!="" && newpassword!=""){
    await axios.post('/edit_password/'+userID,{
            password:password,
            newpassword:newpassword
    }).then((e)=>{
        swal("ok")
            if(e.data.status){
                swal({
                    title: "Password changed successfully...",
                    text: "Please login again with your new password.",
                    icon: "success",
                    button: true,
                    dangerMode: false,
                  })
                  .then(async(willDelete) => {
                    if (willDelete) {
                location.href='/login'
                    }
                })
            }
            else{
                swal("Does not match password as you entered","",  {icon: "warning"});
            }
    })
}
else{
    swal("Are you mad","Fill the columns and try again....",  {icon: "warning"});
}
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
            }else  if(e.data.user){{
                swal("Item Exist","",  {
                    icon: "warning",
                  });
                //location.href('/login')  
             }
            }else{
                location.href='/login'
            }
      })
  }
async function delWishlistItem(wishID){
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then(async(willDelete) => {
        if (willDelete) {
            await axios.get('/del-wish-item/'+wishID).then((e)=>{
                if (e.data.status) {
                    
                    swal("Item deleted", "", "success");
                    location.href='/wishlist'
                }
            })  
        } else {
          swal("Your imaginary file is safe!");
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
        dangerMode: true
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

function delShippAddress(addressID,obj) {    
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
      }).then(async(willDelete) => {
        if (willDelete) {
            await axios.get('/del-ship-address/'+addressID).then((e)=>{
                if (e.data.status) {
                    $(obj).closest('tr').remove()
                    swal("Item deleted", "", "success")
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
async function getEditBanner(bannerID){
    await axios.get('/admin/get_edit_banner/'+bannerID).then((e)=>{
        if (e.data.status) {
            document.getElementById('editbannername').value=e.data.banner.bannername   
            document.getElementById('editheader').value=e.data.banner.header
            document.getElementById('editcontent').value=e.data.banner.content
            
        }
    })    
}


async function getEditCoupen(coupenID){
    await axios.get('/admin/get_edit_coupen/'+coupenID).then((e)=>{
        if (e.data.status) {
            document.getElementById('editcoupenname').value=e.data.coupen.coupenname   
            document.getElementById('editcoupentype').value=e.data.coupen.coupentype
            document.getElementById('editcoupencode').value=e.data.coupen.coupencode
            document.getElementById('editcoupendiscount').value=e.data.coupen.coupendiscount
            
        }
    })    
}

async function delBanner(bannerID,obj) {    
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
      }).then(async(willDelete) => {
        if (willDelete) {
            await axios.get('/admin/del_banner/'+ bannerID).then((e)=>{
                if (e.data.status) {
                    $(obj).closest('tr').remove()
                    swal("Item deleted", "", "success")
                }
            })  
        } else {
          swal("Your imaginary file is safe!");
        }
      })

}   
async function delCoupen(coupenID,obj) {    
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true
      }).then(async(willDelete) => {
        if (willDelete) {
            await axios.get('/admin/del_coupen/'+ coupenID).then((e)=>{
                if (e.data.status) {
                    $(obj).closest('tr').remove()
                    swal("Item deleted", "", "success")
                }
            })  
        } else {
          swal("Your imaginary file is safe!");
        }
      })

}   

// async function addEditShipAddress(){
//     editAddressID=document.getElementById('tempAddressID').value
//     if(editAddressID==""){
//         await axios.post('/add_shipping_address',{
//             name :document.getElementById('shipname').value,
//             streetaddress:document.getElementById('streetaddress').value,
//             altermobile:document.getElementById('altermobile').value,
//             pincode:document.getElementById('pincode').value,
//             landmark:document.getElementById('landmark').value,
//             city:document.getElementById('city').value,
//             district:document.getElementById('district').value,
//             state:document.getElementById('state').value
//         }).then((e)=>{
//                 if(e.data.status){
//                     location.href='/user_profile'
//                 }
//         })
//     }else {
//         await axios.post('/edit_shipping_address/'+editAddressID,{
//             name :document.getElementById('shipname').value,
//             streetaddress:document.getElementById('streetaddress').value,
//             altermobile:document.getElementById('altermobile').value,
//             pincode:document.getElementById('pincode').value,
//             landmark:document.getElementById('landmark').value,
//             city:document.getElementById('city').value,
//             district:document.getElementById('district').value,
//             state:document.getElementById('state').value
//         }).then((e)=>{
//                 if(e.data.status){
//                     location.href='/user_profile'
//                 }
//         })
//     }
// }

async function editShipAddress(addressId,obj,isPlaceorder){
       await axios.get('/edit_ship_address/'+addressId).then((e)=>{
                if (e.data.status) {
                    let add = JSON.stringify(e.data.shipAddress.address[0]);
                   
                    $(obj).closest('#shippingaddress').modal('hide')
                    
                        document.getElementById('shipname').value=e.data.shipAddress.address[0].name   
                        document.getElementById('streetaddress').value=e.data.shipAddress.address[0].streetaddress   
                        document.getElementById('altermobile').value=e.data.shipAddress.address[0].altermobile
                        document.getElementById('pincode').value=e.data.shipAddress.address[0].pincode   
                        document.getElementById('landmark').value=e.data.shipAddress.address[0].landmark   
                        document.getElementById('city').value=e.data.shipAddress.address[0].city   
                        document.getElementById('district').value=e.data.shipAddress.address[0].district   
                        document.getElementById('state').value=e.data.shipAddress.address[0].state
                        if(isPlaceorder){
                        document.getElementById('tempAddressID').value=e.data.shipAddress.address[0]._id                          
                        document.getElementById('btnShipAddress').value=e.data.shipAddress.address[0]._id  
                        }
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



