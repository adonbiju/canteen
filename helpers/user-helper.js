var db = require("../config/connection");
var collections = require("../config/collection");
var bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
const Razorpay = require("razorpay");
const { resolve } = require("url");
const moment = require('moment')

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let emailExist = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
      if(emailExist){
        resolve({emailExist})
      }else{
      userData.password = await bcrypt.hash(userData.password, 10);
      userData.blockuser=false
      db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
          resolve(data.ops[0]);
        });
    }
    });
  },


  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            if (user.blockuser){
              response.blockuser=true
              resolve(response)
            }else{
              console.log("login successful");
              response.user = user;
              response.status = true;
              resolve(response);
            }
            //console.log(response);
          } else {
            console.log("login Failed");
            resolve({status:false});
          }
        });
      } else {
        console.log("login Failed/user blocked");
        resolve({status:false});
      }
    });
  },

  
 //geting all the food items belongs to the particular category 
  getParticularCategoryFoodItems:(categorytName)=>{
  return new Promise(async(resolve,reject)=>{
    let ParticularCategoryFoodItems=await db.get().collection(collections.FOOD_ITEM_COLLECTION).find({category:categorytName}).toArray()
   resolve(ParticularCategoryFoodItems)
  })
},
  addToCart: (itemid, userid) => {
    let itemObj = {
      item: objectId(itemid),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userid) });
      if (userCart) {
        let itemExit = userCart.item.findIndex((item) => item.item == itemid);
        if (itemExit != -1) {
          db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userid), "item.item": objectId(itemid) },
              {
                $inc: { "item.$.quantity": 1 },
              }
            ).then(() => {
              resolve();
            });
        } else {
          db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userid) },
              {
                $push: { item: itemObj },
              }
            ).then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userid),
          item: [itemObj],
        };
        db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
            resolve();
          });
      }
    });
  },

  getCartItems: (userId) => {
    return new Promise(async (resolve) => {
      // console.log(userId)
      let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([{ $match: { user: objectId(userId) } },
          {
            $unwind: "$item",
          },
          {
            $project: {
              item: "$item.item",
              quantity: "$item.quantity",
            },
          },
          {
            $lookup: {
              from: collections.FOOD_ITEM_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "itemDetails",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              itemDetails: { $arrayElemAt: ["$itemDetails", 0] },
            },
          },
          // {
          //     $lookup:{
          //         from:collections.PRODUCT_COLLECTION,
          //         let:{productList:'$products'},
          //         pipeline:[{
          //             $match:{$expr:{$in:['$_id','$$productList']}}
          //         }],
          //         as:'productDetails'
          //     }
          // }
        ]) .toArray();
      // console.log(cartItems)
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      cart = await db.get() .collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.item.length;
      }
      resolve(count);
    });
  },
  changeItemQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
            {
              $pull: { item: { item: objectId(details.item) } },
            }
          ).then((response) => {
            resolve({ removeItem: true });
          });
      } else {
        db.get().collection(collections.CART_COLLECTION).updateOne(
            {
              _id: objectId(details.cart),
              "item.item": objectId(details.item),
            },
            {
              $inc: { "item.$.quantity": details.count },
            }
          ).then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  deleteItemFromCart: (cart, itemId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(cart) },
          {
            $pull: {
              item: { item: objectId(itemId) },
            },
          }
        ).then((response) => {
          resolve();
        });
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve) => {
      console.log(userId)
      let total = await db.get().collection(collections.CART_COLLECTION).aggregate([{ $match: { user: objectId(userId) } },
          {
            $unwind: "$item",
          },
          {
            $project: {
              item: "$item.item",
              quantity: "$item.quantity",
            },
          },
          {
            $lookup: {
              from: collections.FOOD_ITEM_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "itemDetails",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              itemDetails: { $arrayElemAt: ["$itemDetails", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$quantity", { $toInt: "$itemDetails.price" }],
                },
              },
            },
          },
        ]).toArray();
        if(total.length>0){   
          if(total[0].total) {
              resolve(total[0].total) 
          }
          
      }else{
          resolve({total:false})
      }
      //console.log(total)
    });
  },
  placeOrder: (order, items, total) => {
    return new Promise((resolve, reject) => {
      let status = order["payment-method"] === "cod" ? "placed" : "pending";
      let orderObj = {
        deliveryDetails: {
          name: order.name,
          mobile1: order.mobile1,
          mobile2: order.mobile2,
          email: order.email,
          save:order.save
        },
        userId: objectId(order.userId),
        paymentMethod: order["payment-method"],
        item: items,
        totalAmount: total,
        status: status,
        date:  new Date().toISOString().slice(0, 10),
      };
      db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
         let address={}
         address.useraddress=orderObj.deliveryDetails
         address.userId=orderObj.userId
         if(address.useraddress.save=="on"){
          db.get().collection(collections.ADDRESS_COLLECTION).insertOne(address)
         }
          //console.log(orderObj.deliveryDetails.save)
          db.get().collection(collections.CART_COLLECTION).removeOne({ user: objectId(order.userId) });
          resolve(response.ops[0]._id);
        });
    });
  },
  //geting cart db of single user
  getCartItemsList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) });
      resolve(cart.item);
    });
  },

  //get  the orders from oder database based on userId
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId)
      await db.get().collection(collections.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray().then((response) => {
          //console.log(response)
          resolve(response);
        });
    });
  },
  //get item detail based on singele order id
  getOrderFoodItems: (orderId) => {
    return new Promise(async (resolve) => {
      // console.log(orderId)
      let orderFoodItems = await db.get().collection(collections.ORDER_COLLECTION).aggregate([{ $match: { _id: objectId(orderId) } },
          {
            $unwind: "$item",
          },
          {
            $project: {
              item: "$item.item",
              quantity: "$item.quantity",
            },
          },
          {
            $lookup: {
              from: collections.FOOD_ITEM_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "itemDetails",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              itemDetails: { $arrayElemAt: ["$itemDetails", 0] },
            },
          },
        ]).toArray();
      resolve(orderFoodItems);
    });
  },
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          resolve(order);
        }
      });
    });
  },
  veifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "cG0Cvs8WzPUPtmDUPMBFkNvs");
      hmac.update(details["payment[razorpay_order_id]"] + "|" +details["payment[razorpay_payment_id]"]);
      hmac = hmac.digest("hex");
      if (hmac === details["payment[razorpay_signature]"]) {
        console.log("payment sucessfullll!");
        resolve();
      } else {
        reject();
      }
    });
  },
  changePaymentstatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  cancelOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
          {
            $set: {
              status: "cancelled",
              cancel: true,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  getProfileDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((profileDetails) => {
          resolve(profileDetails);
        });
    });
  },
  updateProfileDetails: (userId, profiletDetail) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId);
      // console.log(profiletDetail);
      await db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
          {
            $set: {
              name: profiletDetail.name,
              email: profiletDetail.email,
              mobile1: profiletDetail.mobile1,
              mobile2: profiletDetail.mobile2,
              city: profiletDetail.city,
              state: profiletDetail.state,
              pincode: profiletDetail.pincode,
              country: profiletDetail.country,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  changePassword: (userId, password) => {
    let oldpassword = password.oldpassword;
    let newPassword = password.newpassword;
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) });
      bcrypt.compare(oldpassword, user.password).then(async (status) => {
        if (status) {
          updatedpassword = await bcrypt.hash(newPassword, 10);
          db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
              {
                $set: {
                  password: updatedpassword,
                },
              }
            );
          resolve({ status: true });
        } else {
          resolve({ status: false });
        }
      });
    });
  },

  insertReview: (userId, itemId,itemreview) => {
    return new Promise(async (resolve, reject) => {
      var review = {
        userId: userId,
        username:itemreview.username,
        foodItemId: itemId,
        review:itemreview.review,
        date: moment(new Date()).format('DD/MM/YYYY')
      };
      user = await db.get().collection(collections.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray();
      console.log(user)
      if (user) {
        let itemIds = [];
        for (var i = 0; i < user.length; i++) {
          if((user[i].status).toString()=="Delivered"){
          for (var j = 0; j < user[i].item.length; j++) {
            itemIds.push(user[i].item[j].item);
          }
        }
          //console.log(response[i])
        }
        //check whether the product is matching
        var itemExist = itemIds.toString().includes(itemId.toString());
        if (itemExist) {
          db.get().collection(collections.REVIEW_COLLECTION).insertOne(review);
          resolve({status:true})
        }else{
            resolve({status:false})
        }

      }else{
        resolve({status:false})
      }
      //resolve(user);
    });
  },
  getReview: (itemId) => {
    return new Promise(async (resolve, reject) => {
      review=await db.get().collection(collections.REVIEW_COLLECTION).find({ foodItemId: itemId }).toArray();
     resolve(review);
      
    });
  },


//   checkCoupon:(total,coupon)=>{
//     return new Promise(async(resolve,reject)=>{
//      let couponDetail = await db.get().collection(collections.COUPON_COLLECTION).findOne({'couponcode':coupon.couponcode})
//      if( couponDetail ){
//          if(couponDetail.status){
//              let Coupontotal= parseInt((1-(couponDetail.offer/100))*total)
//              resolve({status:true,coupontotal:Coupontotal})
//          }else{
//              resolve({expired:true})
//          }
//      }else{
//          resolve({notexist:true})
//      }
//     })
// },


getUserAddress: (userId) => {
  return new Promise(async (resolve, reject) => {
      let userAddress = await db.get().collection(collections.ADDRESS_COLLECTION).find({ userId: objectId(userId) }).toArray()
      resolve(userAddress)
  })
},

//Getting user details using mobile numbers 
getMobileDetails: (mobileNumber) => {
  return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTION).findOne({ mobile1: mobileNumber })
      if (user) {
          resolve(user)
      } else {
          resolve()
      }
  })
},
itemSearch: (payload) => {
  return new Promise(async (resolve, reject) => {
    console.log(payload)
    let search = await db.get().collection(collections.FOOD_ITEM_COLLECTION).find(
      { name: { $regex: new RegExp(payload + ".*", "i") } }).toArray();
    resolve(search);
  });
},
}
