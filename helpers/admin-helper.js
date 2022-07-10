var db=require('../config/connection');
var collections=require('../config/collection')
var objectId=require('mongodb').ObjectID;
var bcrypt=require('bcrypt')
const moment = require('moment')

module.exports={
  
   addFoodItem:(foodItemDetail)=>{
     return new Promise(async(resolve,reject)=>{
          let data=await db.get().collection(collections.FOOD_ITEM_COLLECTION).insertOne(foodItemDetail);
          resolve(data.ops[0]._id);
     })

   }
    /* get all product using promise*/
    ,getALLFoodItems:()=>{
      return new Promise(async(resolve,reject)=>{
          let items=await db.get().collection(collections.FOOD_ITEM_COLLECTION).find().toArray()
         resolve(items)
      })
  }
  ,deleteFoodItem:(itemId)=>{
   return new Promise((resolve,reject)=>{
      db.get().collection(collections.FOOD_ITEM_COLLECTION).removeOne({_id:objectId(itemId)}).then((response)=>{
         resolve(response);
      })

   })
}
,getFoodItemDetails:(itemId)=>{
   return new Promise(async(resolve,reject)=>{
     await db.get().collection(collections.FOOD_ITEM_COLLECTION).findOne({_id:objectId(itemId)}).then((item)=>{
         resolve(item)
      })
   })
}
,updateFoodItem:(itemId,itemDetail)=>{
   return new Promise(async(resolve,reject)=>{
    
       await db.get().collection(collections.FOOD_ITEM_COLLECTION).updateOne({_id:objectId(itemId)},{
         $set:{
            name:itemDetail.name,
            category:itemDetail.category,
            description:itemDetail.description,
            price:itemDetail.price, 
         }
      }).then((response)=>{
         resolve(response)
      })
   })

}

,getRandomFoodItems:()=>{
   return new Promise(async(resolve,reject)=>{
      let items= await db.get().collection(collections.FOOD_ITEM_COLLECTION).aggregate([{ $sample :{size :8}}]).toArray()
       resolve(items)
 })
}
,getRelatedFoodItems:(category1)=>{
   return new Promise(async(resolve,reject)=>{
      let relatedfooditems= await db.get().collection(collections.FOOD_ITEM_COLLECTION).aggregate([{$match: {category:category1}},{ $sample :{size :4}}]).toArray()
      resolve(relatedfooditems)
})
}
   ,addCategory:(categoryDetails)=>{
    return new Promise(async(resolve,reject)=>{
        let categoryData=await db.get().collection(collections.CATEGORY_COLLECTION).insertOne(categoryDetails);
        resolve(categoryData.ops[0]._id);
    })

  }
  ,getALLCategory:()=>{
    return new Promise(async(resolve,reject)=>{
        let allCategory=await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
       resolve(allCategory)
    })
  }
  ,deleteCategory:(categoryId)=>{
    return new Promise((resolve,reject)=>{
       db.get().collection(collections.CATEGORY_COLLECTION).removeOne({_id:objectId(categoryId)}).then((response)=>{
          resolve(response);
       })

    })
 }
 ,getCategorytDetails:(categoryId)=>{
    return new Promise(async(resolve,reject)=>{
      await db.get().collection(collections.CATEGORY_COLLECTION).findOne({_id:objectId(categoryId)}).then((category)=>{
          resolve(category)
       })
    })
 }

 ,updateCategory:(categoryId,categoryDetail)=>{
    return new Promise(async(resolve,reject)=>{
   
        await db.get().collection(collections.CATEGORY_COLLECTION).updateOne({_id:objectId(categoryId)},{
          $set:{
             categoryName:categoryDetail.categoryName
          }
       }).then((response)=>{
          resolve(response)
       })
    })

 }
,getALLusers:()=>{
      return new Promise(async(resolve,reject)=>{
         let usersList=await db.get().collection(collections.USER_COLLECTION).find().toArray()
         resolve(usersList)
   })
   }
,deleteUser:(userId)=>{
   return new Promise((resolve,reject)=>{
      db.get().collection(collections.USER_COLLECTION).removeOne({_id:objectId(userId)}).then((response)=>{
         resolve(response);
      })

   })
}
,doLogin:(data)=>{
   return new Promise(async(resolve,reject)=>{
       let response={}
       let admin = {}
       admin.email = "adon@gmail.com"
       admin.password = "$2a$10$0GacidLXw.NVGMi7EA8zb.A3MCyYIsuPgn6Ar.sXDjX6zpJIrkfeG"
      if(admin.email===data.email){ 
       bcrypt.compare(data.password,admin.password).then((status)=>{
               if(status){
               response.admin=admin
               response.status=true
               resolve(response)
           }else{
               resolve({status:false})
           }
           })}else{
            resolve({status:false})
           }
   })

} 
,blockUser:(userId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},
       {$set:{
         blockuser:true
       }}).then((response)=>{
           resolve()
       })
   })
}
,unblockUser:(userId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},
       {$set:{
        blockuser:false
       }}).then((response)=>{  
           resolve()
       })
   })
}
,getALLOrders:()=>{
   return new Promise(async(resolve,reject)=>{
       let orders=await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
      resolve(orders)
   })
},
changeStatus:(orderId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
       {
           $set:{
               status:'Order-ready',
               order_ready:true//For controling the order status option
           }
       }).then(()=>{
           resolve({status:true})
       })
   })
},
changeStatusDelivered:(orderId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
       {
           $set:{
               status:'Delivered',
               delivered:true
           }
       }).then(()=>{
           resolve({status:true})
       })
   })
},
insertCoupon:(coupons)=>{
   return new Promise((resolve,reject)=>{
      coupons.offer=parseInt(coupons.offer)
      db.get().collection(collections.COUPON_COLLECTION).insertOne(coupons);
   })
}
,availableCoupons:()=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.COUPON_COLLECTION).find().toArray().then((data)=>{
           resolve(data)
       })
   })
},

deleteCoupon:(couponId)=>{
   return new Promise((resolve,reject)=>{
      //console.log(couponId);
      //console.log(objectId(couponId));
      db.get().collection(collections.COUPON_COLLECTION).removeOne({_id:objectId(couponId)}).then((response)=>{
         resolve(response);
      })

   })
},
activateCoupon:(couponId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.COUPON_COLLECTION).updateOne({_id:objectId(couponId)},
       {$set:{
           status:true
       }}).then(()=>{
           resolve()
       })
   })
},
deactivateCoupon:(couponId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.COUPON_COLLECTION).updateOne({_id:objectId(couponId)},
       {$set:{
           status:false
       }}).then(()=>{
           resolve()
       })
   })
}

,paymentMethods: () => {
   let Methods = []
   return new Promise(async (resolve, reject) => {
       let CodProduct = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  paymentMethod: 'cod'
               }
           }
       ]).toArray()
       let codlen = CodProduct.length
       Methods.push(codlen)

       let onlineProduct = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  paymentMethod: 'online'
               }
           }
       ]).toArray()
       let onlinelen = onlineProduct.length
       Methods.push(onlinelen)

       resolve(Methods)
   })
},
OrderStatus: () => {
   let status = []
   return new Promise(async (resolve, reject) => {
       let pending = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  status: 'pending'
               }
           }
       ]).toArray()
       let pendinglen = pending.length
       status.push(pendinglen)
       let placed = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  status: 'placed'
               }
           }
       ]).toArray()
       let placedlen = placed.length
       status.push(placedlen)

       let order_ready = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  status: 'Order-ready'
               }
           }
       ]).toArray()
       let shippedlen = order_ready.length
       status.push(shippedlen)


       let delivered = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  status: 'Delivered'
               }
           }
       ]).toArray()
       let deliveredlen = delivered.length
       status.push(deliveredlen)

       let cancelled = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                  status: 'cancelled'
               }
           }
       ]).toArray()
       let cancelledlen = cancelled.length
       status.push(cancelledlen)
       resolve(status)
   })
},
getFoodItemCount: () => {
   return new Promise(async (resolve, reject) => {
       let foodItemCount = await db.get().collection(collections.FOOD_ITEM_COLLECTION).count()
       resolve(foodItemCount)
   })
},
getUserCount: () => {
   return new Promise(async (resolve, reject) => {
       let usercount = await db.get().collection(collections.USER_COLLECTION).count()
       resolve(usercount)
   })
},
getProfit: () => {
   return new Promise(async (resolve, reject) => {
       let newtotal=0
       let total = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
           {
               $match: {
                   status: 'Delivered'
               }
           },
           {
               $group: {
                   _id: null,
                   total: { $sum: '$totalAmount' }
               }
           }
       ]).toArray()
       if(total[0]){
          // console.log(total)
           resolve(total[0].total)             
       }else{
           resolve(newtotal)
       }            
   })
},
getDeliveredCount: () => {
   return new Promise(async (resolve, reject) => {
      let delivered = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
         {
             $match: {
                status: 'Delivered'
             }
         }
     ]).toArray()
     let deliveredCount = delivered.length
       resolve( deliveredCount)
   })
},
getOrderReport:(data)=>{
    let StartDate=data.StartDate
    let EndDate=data.EndDate
   //  console.log(StartDate);
   //  console.log(EndDate);
    return new Promise(async(resolve,reject)=>{
       orderData=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
         {
           $match: {
             date: {
               $gte: StartDate,
               $lte: EndDate,
             },
           },
         }]).toArray()
       resolve(orderData)
    })
},

addBannerDetails:(banner)=>{
   return new Promise(async(resolve,reject)=>{
      db.get().collection(collections.BANNER_COLLECTION).insertOne(banner).then((response) => {
         resolve(response.ops[0]._id)
       });
   })
},
getALLBanners:()=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.BANNER_COLLECTION).find().toArray().then((banner)=>{
           resolve(banner)
       })
   })
},

activateBanner:(bannerId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collections.BANNER_COLLECTION).updateOne({_id:objectId(bannerId)},
       {$set:{
           status:true
       }}).then(async()=>{
           let banners=await db.get().collection(collections.BANNER_COLLECTION).find().toArray()
           if(banners){
            let bannerIds=[]
            for(i=0;i<banners.length;i++){
               bannerIds.push(banners[i]._id.toString())
            }

            var bannerIdToString=bannerId.toString()
            var bannerIdsToDeactivate = bannerIds.filter(function(f) { return f !== bannerIdToString})
            console.log(bannerIdsToDeactivate)
            if(bannerIdsToDeactivate){
               for(i=0;i<bannerIdsToDeactivate.length;i++){
                  db.get().collection(collections.BANNER_COLLECTION).updateOne({_id:objectId(bannerIdsToDeactivate[i])},
                  {$set:{
                      status:false
                  }})
               }
            }
           }
           
           resolve()
       })
   })
},
deleteBanner:(bannerId)=>{
   return new Promise((resolve,reject)=>{
      db.get().collection(collections.BANNER_COLLECTION).removeOne({_id:objectId(bannerId)}).then((response)=>{
         resolve(response);
      })

   })
},

getBannerDetails:(bannerId)=>{
   return new Promise(async(resolve,reject)=>{
     await db.get().collection(collections.BANNER_COLLECTION).findOne({_id:objectId(bannerId)}).then((bannerDetail)=>{
         resolve(bannerDetail)
      })
   })
},

updateBannerDetails:(bannerId,bannerDetail)=>{
   return new Promise(async(resolve,reject)=>{
    
       await db.get().collection(collections.BANNER_COLLECTION).updateOne({_id:objectId(bannerId)},{
         $set:{
            title1:bannerDetail.title1,
            title2:bannerDetail.title2,
         }
      }).then((response)=>{
         resolve(response)
      })
   })

}

}

