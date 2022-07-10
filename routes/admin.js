var express = require('express');
var router = express.Router();
const adminHelper= require('../helpers/admin-helper')
const userHelper = require('../helpers/user-helper');
const fs=require('fs');
const { response } = require('express');

//twilio
const accountSid =process.env.accountSid
const authToken = process.env.authToken
const messagingSid=process.env.messagingSid
const client = require('twilio')(accountSid,authToken); 

const verifyLogin = (req, res, next) => {
  if (req.session.adminloggedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
}


/**Admin login section  */
router.get("/", async(req, res) => {
  let admin = req.session.adminloggedIn;
  if (admin) {
      let paymentMethod=await adminHelper.paymentMethods();
      let orderStatus=await adminHelper.OrderStatus();
      let FoodItemCount=await adminHelper.getFoodItemCount();
      let UserCount=await adminHelper.getUserCount();
      let profit=await adminHelper.getProfit();
      let delivredCount=await adminHelper.getDeliveredCount()
      res.render('admin/dashboard',{admin:true,paymentMethod,orderStatus,FoodItemCount,UserCount,profit,delivredCount})
  } else {
    res.render("admin/adminlogin", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.post("/", (req, res) => {
  adminHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminloggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.loginErr = "Invalid Username or Password!!";
      res.redirect("/admin");
    }
  });
});

router.get("/adminlogout", (req, res) => {
  req.session.admin=null;
  req.session.adminloggedIn = false;
  res.redirect("/admin");
});


/**Admin login section end here */
router.get('/add-food-item',verifyLogin, async function(req,res){
  let allCategory=await adminHelper.getALLCategory() 
  res.render('admin/add-food-item',{admin:true,allCategory})
})

router.post('/add-food-item',function(req,res){
 adminHelper.addFoodItem(req.body).then((id)=>{
    let image=req.files.image
    image.mv('./public/images/'+id+'.jpg')
    res.redirect('/admin/add-food-item')
  })
});

router.get("/all-food-items", verifyLogin,async(req, res) => {
  adminHelper.getALLFoodItems().then((items)=>{
  res.render('admin/all-food-items',{items,admin:true})
})
});

router.get('/delete-food-item/:id',(req,res)=>{
  let itemId=req.params.id
  adminHelper.deleteFoodItem(itemId).then((response)=>{
   fs.unlinkSync('./public/images/'+itemId+'.jpg')
   res.redirect('/admin/all-food-items')
  })
})

router.get('/edit-food-item/:id',verifyLogin,async(req,res)=>{
  allCategory=await adminHelper.getALLCategory()
  adminHelper.getFoodItemDetails(req.params.id).then((item)=>{
    res.render('admin/edit-food-item',{item,admin:true,allCategory});
  })  
})

router.post('/edit-food-item/:id',(req,res)=>{
  console.log(req.body);
  adminHelper.updateFoodItem(req.params.id,req.body).then((response)=>{
    res.redirect('/admin/all-food-items')
      if(req.files){
        let image=req.files.image
       image.mv('./public/images/'+req.params.id+'.jpg');
      }   
  })
})

router.get('/add-category',verifyLogin,async function(req,res){
  let allCategory=await adminHelper.getALLCategory() 
  res.render('admin/add-category',{admin:true,allCategory})
})

router.post('/add-category',(req,res)=>{
  adminHelper.addCategory(req.body).then((id)=>{
    let image=req.files.image
    image.mv('./public/category/'+id+'.jpg')
    res.redirect('/admin/add-category')
  })
});

router.get('/delete-category/:id',(req,res)=>{
  let categoryId=req.params.id
  adminHelper.deleteCategory(categoryId).then((response)=>{
   fs.unlinkSync('./public/category/'+categoryId+'.jpg')
   res.redirect('/admin/add-category')
  })
})

router.get('/edit-category/:id',(req,res)=>{
  adminHelper.getCategorytDetails(req.params.id).then((category)=>{
    res.render('admin/edit-category',{category,admin:true});
  })  
})

router.post('/edit-category/:id',(req,res)=>{
  adminHelper.updateCategory(req.params.id,req.body).then((response)=>{
    if(req.files){
      if(req.files.image){
        let image=req.files.image
       image.mv('./public/category/'+req.params.id+'.jpg');
      }
    }
    res.redirect('/admin/add-category') 
  })
})

router.get('/users-list',verifyLogin,async(req,res)=>{
  userlist=await adminHelper.getALLusers()
  res.render('admin/users-list',{userlist,admin:true})
})

router.get('/delete-user/:id',(req,res)=>{
  let userId=req.params.id
  console.log(userId)
  adminHelper.deleteUser(userId).then((response)=>{
    const pathToFile = './public/profile/'+userId+'.jpg'
    if (fs.existsSync(pathToFile)) {
    fs.unlink(pathToFile, function (err) {
      if (err) {
        throw err;
      } else {
        console.log("Successfully deleted the file.");
      }
    });
    res.redirect('/admin/users-list')
  }else{
    res.redirect('/admin/users-list')
  }
  })
})

router.get('/block-user/:id',(req,res)=>{
  userId=req.params.id
  adminHelper.blockUser(userId).then(()=>{
    res.redirect('/admin/users-list')
  })
})
router.get('/unblock-user/:id',(req,res)=>{
  userId=req.params.id
  adminHelper.unblockUser(userId).then(()=>{
    res.redirect('/admin/users-list')
  })
})

router.get('/view-orders',verifyLogin,async(req,res)=>{
  orders=await adminHelper.getALLOrders()
  res.render('admin/view-orders',{orders,admin:true})
})
router.get('/view-order-items/:id',verifyLogin,async(req,res)=>{
  orderItemDetails=await userHelper.getOrderFoodItems(req.params.id);
  res.render('admin/view-order-items',{admin:true,orderItemDetails})
})

router.post("/changeToOrderready", (req, res) => {
  userName=req.body.userName;
  mobile1=req.body.mobile1;
  totalAmount=req.body.totalAmount
  adminHelper.changeStatus(req.body.order).then((response) => {
    client.messages .create({ 
         body: ` Hi ${userName},
                 Your order is ready.
                The total amount is Rs ${totalAmount} .`,  
         messagingServiceSid: messagingSid,      
         to: `+91${req.body.mobile1}`,
       }) 
      .then(message => console.log("message sent sucessfully!!!!")) 
      .done();
    res.json({ status: true });
  });
});



router.post("/changeToDeliver", (req, res) => {
  userName=req.body.userName;
  mobile1=req.body.mobile1;
  totalAmount=req.body.totalAmount
  adminHelper.changeStatusDelivered(req.body.order).then((response) => {
    client.messages .create({ 
       body: ` Hi ${userName},
              Your order is Delivered.
              The total amount is Rs ${totalAmount}`,   
       messagingServiceSid: messagingSid,      
       to: `+91${req.body.mobile1}`
     }) 
    .then(message => console.log("message sent sucessfully!!!!")) 
    .done();
    res.json({ status: true });
  })
});

router.get("/add-coupon",verifyLogin, (req, res) => {
 adminHelper.availableCoupons().then((coupons)=>{
  res.render('admin/add-coupon',{admin:true,coupons})
 })
});


router.post("/add-coupon",(req, res) => {
  adminHelper.insertCoupon(req.body);
  res.redirect("/admin/add-coupon")
});

router.get('/delete-coupon/:id',verifyLogin,(req,res)=>{
  let couponId=req.params.id
  adminHelper.deleteCoupon(couponId).then((response)=>{
    res.redirect("/admin/add-coupon")
  })
})

router.get('/activate-coupon/:id',verifyLogin,(req,res)=>{
  let couponId=req.params.id
  adminHelper.activateCoupon(couponId).then((response)=>{
    res.redirect("/admin/add-coupon")
  })
})

router.get('/deactivate-coupon/:id',verifyLogin,(req,res)=>{
  let couponId=req.params.id
  adminHelper.deactivateCoupon(couponId).then((response)=>{
    res.redirect("/admin/add-coupon")
  })
})

router.get('/order-report', verifyLogin,(req, res) => {
  res.render('admin/order-report', { admin: true })
})

router.post('/order-report', verifyLogin,async (req, res) => {
  orders = await adminHelper.getOrderReport(req.body)
  res.render('admin/order-report', { admin: true, orders })
})

router.get('/banner', verifyLogin,async(req, res) => {
  let banners=await adminHelper.getALLBanners();
  res.render('admin/banner', { admin: true,banners })
})

router.post("/banner",(req, res) => {
  adminHelper.addBannerDetails(req.body).then((id)=>{
    if(req.files){
      if(req.files.image){
        let image=req.files.image
        image.mv('./public/banner/'+id+'.jpg');
      }
    }
    res.redirect('/admin/banner')
  })
  
})

router.get('/activate-banner/:id',verifyLogin,(req,res)=>{
  let bannerId=req.params.id
  adminHelper.activateBanner(bannerId).then((response)=>{
    res.redirect("/admin/banner")
  })
})

router.get('/delete-banner/:id',verifyLogin,(req,res)=>{
  let bannerId=req.params.id
  adminHelper.deleteBanner(bannerId).then((response)=>{
    fs.unlinkSync('./public/banner/'+bannerId+'.jpg')
    res.redirect("/admin/banner")
  })
})

router.get('/edit-banner/:id',verifyLogin,async(req,res)=>{
  let bannerDetail = await adminHelper.getBannerDetails(req.params.id);
  res.render('admin/edit-banner',{admin:true,bannerDetail});
})

router.post('/edit-banner/:id',(req,res)=>{

  adminHelper.updateBannerDetails(req.params.id,req.body).then((response)=>{
    res.redirect('/admin/banner')
      if(req.files){
        let image=req.files.image
       image.mv('./public/banner/'+req.params.id+'.jpg');
      }   
  })
})

module.exports = router;
