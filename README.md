# CANTEEN
CANTEEN is a dynamic Web application which mainly focuses on our canteen (in our college) which digitize most of the work in managing a canteen. It also Provides login authentication with phone number where OTP verification has been send as phone call or text SMS. This Project was established
using Hbs(Handlebars), Node.js, Express.js and MongoDB. 


![User Page1](/Documentation/canteen.jpg)
# Technologies used :
    * Hbs(Handlebars)
    * JavaScript
    * Node.js
    * Express.js
    * MongoDB

# APIs Used
    * Twilio
    * Razorpay 
# Features on user side
   * Register: The user has to register to the system with all the necessary details like name, email id, password. If any other account have used this same email id then the user will be asked to change the email address.
   * Login: User have to login with their credentials to access his account. If the email id or password is wrong, a notification showing “invalid email id or password” will be displayed.
   * Login with otp: It also Provides login authentication with phone number where OTP verification will be sent as phone call or text SMS.
   * Profile Settings: The user can update his details in the account and also the user can change his account password.
   * Menu List: It shows various available food in the canteen with respect to different category.
   * Item Details: The user can view the details of the food item that are available and can view the reviews about that particular food item that are written by the users who have already ordered it
   * View Cart: In the cart the user can see the selected food items and can increase or decrease the quantity of the food and also the user can remove any food item from the cart.
   * Payment: User can complete the transaction by doing the payment either by cash on delivery or online transaction.
   * Order History: The user can view the details of all his previous orders 
   * View Orders and Status: The user gets notification regarding the order he have placed and the user can cancel the order before he gets the order ready message.
   * Review: The user can write review about any food item if he have already ordered that particular food item.

  
# Features on admin side
  *	Login: Admin have to login with their credentials to access system. If the email id or password is wrong, a notification showing “invalid email id or password” will be displayed.
  *	Dashboard: The admin can view the total number of users, total profit, total food items available in the canteen, total food items delivered and also, he can view the statistics of order status in bar graph and payment methods of the orders in pie graph 
  *	Add Food Items: Admin can add food in to the system and varios details related to that food item. 
  *	Edit / Delete Items: Admin can edit the details of food items and also can delete any food item from the list. 
  *	View Orders: Admin could directly track any particular order. And also, admin can send an order ready SMS notification after the order is ready and he can also send a delivery confirmation message after the order is complete.
  *	View Transactions: Admin can view the details of all the transactions done by any user along with the details of the food item that user ordered.
  *	View Users: The admin can view the details like name, email id, and status of any users. The status will show the list of all the active and inactive users.
  *	Add category: where admin can add new category to the system with category name and image.
  *	Edit or Delete Category: The admin can edit the details of the existing food items and also can delete any category.
  *	Manage User: where admin can Block or Unblock any user and also the admin can completely delete the details of the existing users. When the admin block any particular user, that user can not login to his account 
  *	Order Report: The admin can view the history of all orders from a particular period and he can also download this report as csv, pdf or excel files.


# Demo
   *  user:   https://adoncanteen.onrender.com
   *  admin:  https://adoncanteen.onrender.com/admin
   
# Future Updations :
 * Google Authentication

