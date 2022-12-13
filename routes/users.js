const { response } = require('express');
var express = require('express');
var router = express.Router();
var adminHelper=require('../helpers/admin-helper');
const userHelper = require('../helpers/user-helper');
var UserHelper=require('../helpers/user-helper')
var db=require('../config/connection');

//twilio
const accountSid =process.env.accountSid
const authToken = process.env.authToken
const client = require('twilio')(accountSid,authToken); 
const verificationToken=process.env.verificationToken

//Using of midelware
const verifyLogin=(req,res,next)=>{
   if(req.session.logedIn)
   {
   next();
   }else{
     res.redirect('/login')
   }
}

router.get('/',async(req,res)=>{
  if(db.get()===null){
    res.render('user/something-went-wrong')
  }else{
  let user_login=req.session.user;
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  let allCategory=await adminHelper.getALLCategory() 
  let banners=await adminHelper.getALLBanners();
  adminHelper.getRandomFoodItems().then((items)=>{
    res.render('user/home',{user:true,user_login,cartCount,items,allCategory,banners})
  })
  }
  
  // res.render('user/home',{user:true,user_login,cartCount})
})

router.get('/login', async(req, res) => {
  let allCategory=await adminHelper.getALLCategory() 
  //console.log(req.session.user)
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/login',{user:true,"logedinErr":req.session.logedinErr, blockuser: req.session.blockuser,allCategory})
    req.session.logedinErr=false
    req.session.blockuser=false
  } 
})

router.get('/signup', (req, res) => {
  emailExist=req.session.emailExist
  res.render('user/signup',{user:true,emailExist})
  req.session.emailExist=false
})

router.post('/signup',(req,res)=>{
 UserHelper.doSignup(req.body).then((response)=>{
  //console.log(response.emailExist);
   if(response.emailExist){
    req.session.emailExist = "Email is already Exist!!!";
    res.redirect('/signup')
   }else{
   req.session.user=response;
   req.session.logedIn=true;
   res.redirect('/')
   }
 })
})

router.post('/login',(req,res)=>{
  UserHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      /* Here we create an session for single user with its all details */
      req.session.user=response.user;
      req.session.logedIn=true;
      res.redirect('/')
    }else{
      if(response.blockuser){
        req.session.blockuser=response.blockuser
        res.redirect('/login')
      }else{
        req.session.logedinErr=true;
        res.redirect('/login')
      }
      
    }
    
  })
})

router.get('/mobile-number', (req, res) => {
  if(req.session.logedIn){
    res.redirect('/')
  }
  else{
    res.render('user/mobile-number',{user:true,"nouser":req.session.noUser,"accoutBlocked": req.session.accountBlocked})
    req.session.noUser = false
    req.session.accountBlocked=false
}
})

router.post('/mobile-number', (req, res) => {
  let mobileNo = req.body.mobile
  userHelper.getMobileDetails(mobileNo).then((user) => {
   // console.log(user)
   if(user){
     if(user. blockuser===false){
         client.verify.services(verificationToken).verifications.create({
           to: `+91${req.body.mobile}`,
            channel: "sms"
         }).then((resp) => {
              req.session.mobileNumber = resp.to
              res.redirect('/otp-verification')
    }).catch((err) => {
      console.log(err)
    })
  }
    else{
      req.session.accountBlocked=true
      res.redirect('/mobile-number')
      console.log("account is blocked")
  }
    
   }else{
    req.session.noUser = true
    res.redirect('/mobile-number')
     console.log("No user found111111")
   }

  })
})

router.post('/mobile-number1', (req, res) => {
  let mobileNo = req.body.mobile
  userHelper.getMobileDetails(mobileNo).then((user) => {
   if(user){
     if(user. blockuser===false){
         client.verify.services(verificationToken).verifications.create({
           to: `+91${req.body.mobile}`,
            channel: "call"
         }).then((resp) => {
              req.session.mobileNumber = resp.to
              res.redirect('/otp-verification')
    }).catch((err) => {
      console.log(err)
    })
  }
    else{
      req.session.accountBlocked=true
      res.redirect('/mobile-number')
      console.log("account is blocked")
  }
    
   }else{
    req.session.noUser = true
    res.redirect('/mobile-number')
     console.log("No user found111111")
   }

  })
})


router.get('/otp-verification', async (req, res) => {
  if(req.session.logedIn){
    res.redirect('/')
    } else {
      mobileNumber = req.session.mobileNumber
      res.render('user/otp-verification',{user:true,mobileNumber,"invalidOtp":req.session.invalidOtp})
      req.session.invalidOtp=false
      
  }
})
router.post('/otp-verification', (req, res) => {
  let otp= req.body.otp
  console.log(otp)
  let number = req.session.mobileNumber
  client.verify
    .services(verificationToken)
    .verificationChecks.create({
      to: number,
      code: otp
    }).then((response) => {
      if (response.valid) {
        number = number.slice(3);
        userHelper.getMobileDetails(number).then(async (user) => {
          req.session.user = user
          req.session.logedIn=true;
          res.redirect('/')
        })
      } else {
        console.log("otp entered is not valid");
        req.session.invalidOtp=true
        res.redirect('/otp-verification')
      }
    }).catch((err) => {
      req.session.invalidOtp=true
      console.log("otp errorrrrr")
      //console.log(err)
      res.redirect('/otp-verification')
    })
})

router.get('/logout',(req,res)=>{
  req.session.user = null;
  req.session.logedIn = false;
  res.redirect('/');
})

router.get('/food-item-category/:categoryName',async(req, res) => {
  let user_login=req.session.user
  let categoryName=req.params.categoryName
  let allCategory=await adminHelper.getALLCategory() 
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  ParticularCategoryFoodItems=await userHelper.getParticularCategoryFoodItems(categoryName)
  res.render('user/category',{user:true,user_login,categoryName,ParticularCategoryFoodItems,allCategory,cartCount})
})

router.get('/View-single-food-item/:id',async(req,res)=>{
  let user_login=req.session.user;
  let allCategory=await adminHelper.getALLCategory() 
 let cartCount=null
 reviewedFoodItem= await userHelper.getReview(req.params.id)
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }

   adminHelper.getFoodItemDetails(req.params.id).then((item)=>{
    adminHelper.getRelatedFoodItems(item.category).then((relatedfooditems)=>{
      //console.log(relatedfooditems);
      //Here relatedfooditems means detail of all related item based on their category
      reviewError=req.session.errorMessage
      res.render('user/single-food-item-details',{relatedfooditems,item,user:true,user_login,cartCount, reviewedFoodItem,reviewError,allCategory});
      req.session.errorMessage=false;
    })
  })  
 
})



router.get('/cart',verifyLogin,async(req,res)=>{
  let user_login=req.session.user;
  let allCategory=await adminHelper.getALLCategory() 
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }

  let item_list=await userHelper.getCartItems(req.session.user._id)
  let totalAmount=0
 if(item_list.length>0){
     totalAmount=await userHelper.getTotalAmount(req.session.user._id)
 }
 if(totalAmount<=0){
  res.redirect('/empty-cart')

 }
  res.render('user/cart',{user:true,item_list,user_login,totalAmount,cartCount,allCategory})
})


router.get('/add-to-cart/:id',(req,res)=>{
   if(req.session.logedIn){
    userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
      res.json({status:true})
      });
   }

    else{
      res.json({status:false})
      console.log("please login")
      
    }
  })

router.post('/change-item-quantity',(req,res,next)=>{
  userHelper.changeItemQuantity(req.body).then(async(response)=>{
    response.total=await userHelper.getTotalAmount(req.session.user._id)
   res.json(response)
  })
})


router.get("/remove-item-from-cart/:id/:itemId", (req, res, next) => {
  userHelper.deleteItemFromCart(req.params.id,req.params.itemId).then(() => {
    res.redirect('/cart')
  });
});

router.get('/empty-cart',verifyLogin,async(req,res)=>{
  let cartCount=0;
  let allCategory=await adminHelper.getALLCategory() 
  let user_login=req.session.user;
  res.render('user/empty-cart',{user:true,user_login,cartCount,allCategory})
})


router.get('/empty-order',verifyLogin,async(req,res)=>{
  let user_login=req.session.user;
  let allCategory=await adminHelper.getALLCategory() 
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id, cartCount)
  }
  res.render('user/empty-order',{user:true,user_login,cartCount,allCategory})
})

router.get('/place-order',verifyLogin,async (req,res)=>{
  let user_login=req.session.user;
  let allCategory=await adminHelper.getALLCategory() 
  address=await userHelper.getUserAddress(req.session.user._id)
  let total=await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{user:true,user_login,total,address,allCategory})
})

router.post('/place-order',async(req,res)=>{
  let items=await userHelper.getCartItemsList(req.body.userId);
  let totalPrice=await userHelper.getTotalAmount(req.body.userId);
  userHelper.placeOrder(req.body,items,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='cod'){
      res.json({codstatus:true})
    }else{
      userHelper.generateRazorpay(orderId,totalPrice).then((response)=>{
       //  console.log(response);
        res.json(response)
        
      })
    }
  })
})

router.get('/order-placed-sucessfully',verifyLogin,async(req,res)=>{
  let user_login=req.session.user;
  let allCategory=await adminHelper.getALLCategory() 
  let cartCount=0;
  res.render('user/order-placed-sucessfully',{user:true,user_login,cartCount,allCategory})
})


router.get('/view-order',verifyLogin,async(req,res)=>{
  let user_login=req.session.user;
  let allCategory=await adminHelper.getALLCategory() 
  //console.log(user_login)
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  let orderDetails=await userHelper.getUserOrders(user_login._id)
  if(orderDetails.length<=0){
    res.redirect('/empty-order')
  }
  res.render('user/view-order',{user:true,user_login,orderDetails,cartCount,allCategory})
})

router.get('/view-order-items/:id',async(req,res)=>{
  let user_login=req.session.user;
  let allCategory=await adminHelper.getALLCategory() 
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  orderFoodItemDetails=await userHelper.getOrderFoodItems(req.params.id);
  res.render('user/view-order-items',{user:true,user_login,orderFoodItemDetails,cartCount,allCategory})
})


router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  userHelper.veifyPayment(req.body).then(()=>{
    userHelper.changePaymentstatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })

  }).catch((err)=>{
    console.log(err);
    res.json({status:false})
  })
})

router.get("/cancel-order/:id", (req, res) => {
  UserHelper.cancelOrder(req.params.id).then(() => {
    res.redirect("/view-order");
  });
});



router.get("/edit-profile",verifyLogin,async(req, res) => {
  user_login=req.session.user
  let allCategory=await adminHelper.getALLCategory() 
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  userHelper.getProfileDetails(user_login._id).then((profileDetails)=>{
   // console.log(profileDetails)
    res.render("user/edit-profile",{user:true, user_login,profileDetails,cartCount,allCategory})
  })  
});

router.post('/edit-profile/:id',(req,res)=>{
  userHelper.updateProfileDetails(req.params.id,req.body).then((response)=>{
    if(req.files){
      if(req.files.image){
        let image=req.files.image
        image.mv('./public/profile/'+req.params.id+'.jpg');
      }
    }
    res.redirect('/')
  })
})


router.get("/change-password",verifyLogin, async(req, res) => {
  let cartCount=null
  let allCategory=await adminHelper.getALLCategory() 
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  user_login=req.session.user
  message= req.session.message
  res.render("user/change-password",{user:true,user_login,cartCount,message,allCategory})
  req.session.message = false;
})

router.post("/change-password/:id",verifyLogin, (req, res) => {
 userHelper.changePassword(req.params.id,req.body).then((response)=>{
   console.log(response);
   if (response.status){
    res.redirect("/edit-profile");
   }else{
    req.session.message= "You have entered a wrong password";
    res.redirect("/change-password");
   }
 })
})



router.post("/review",(req, res) => {
console.log(req.body)
  if(req.session.user){
    userHelper.insertReview(req.body.userId,req.body.itemId,req.body).then((response)=>{
      if(response.status){
        //console.log(response);
        var url_itemId = encodeURIComponent(req.body.itemId);
        res.redirect('/View-single-food-item/'+url_itemId)
      }else{
        //console.log("you nedd to buy this product/Product not deleiverd Yet");
        req.session.errorMessage="you need to buy this food item OR you can write review after the food deliverd"
        var url_itemId = encodeURIComponent(req.body.itemId);
        res.redirect('/View-single-food-item/'+url_itemId)
      }})
  }else{
    //if user not login
    res.redirect('/login')
  }
})

router.post("/getSearchItems", async (req, res) => {
  let payload = req.body.payload.trim();
  userHelper.itemSearch(payload).then((search) => {
    res.send({ payload: search });
  });
});

// router.post("/coupon",verifyLogin,async (req, res) => {
//   let total=await userHelper.getTotalAmount(req.session.user._id)
//   userHelper.checkCoupon(total,req.body).then((response)=>{
    
//     res.json(response)
//     if(response.status){
//       console.log("coupon applied",response.coupontotal)
//     }else{
//       console.log("coupon not applied")
//     }
//   })
// })

module.exports = router;
