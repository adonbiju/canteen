$(document).bind("contextmenu",function(e){
  return false;
});
//=======================USER SECTION JAVASCRIPT===================================
function addToCart(itemId){
    $.ajax({
        url:'/add-to-cart/'+itemId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1;
                $("#cart-count").html(count)
                Swal.fire({
                    title: 'Cart',
                    text: 'This Item added to cart',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                  })
            }else{
                location.href="/login"
            }
        }
    })
}

function sendData(e) {
  const searchResults = document.getElementById("searchResults");
  let match = e.value.match(/^[a-zA-Z]*/);
  let match2 = e.value.match(/\s*/);
  if (match2[0] === e.value) {
    searchResults.innerHTML = "";
    return;
  }
  if (match[0] === e.value) {
    fetch("/getSearchItems", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: e.value }),
    })
      .then((res) => res.json())
      .then((data) => {
        let payload = data.payload;
        searchResults.innerHTML = "";
        if (payload.length < 1) {
          searchResults.innerHTML =
            '<p style="background-color:#ffff;color:rgb(89, 87, 87);padding:2%;margin:0">Sorry. Nothing Found</p>';
          return;
        }
        payload.forEach((item, index) => {
          if (index > 0)
          searchResults.innerHTML += '<hr style="margin:0;padding:0">';
          searchResults.innerHTML += `<a class="dropdown-item border-0 transition-link"  href="/View-single-food-item/${item._id}">${item.name}</a>`;
        });
      });

    return;
  }
}
  function deleteFoodItemFromCart(event) {

    event.preventDefault();
    var link = event.currentTarget.href;
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Deleted!',
            'Your food item has been deleted.',
            'success'
          ).then(()=>{
            window.location = link
          })
          
        }   else {
            return false;
          }
      })
  }

  function cancelOrder(event){
    event.preventDefault();
    var link = event.currentTarget.href;
    Swal.fire({
      title: 'Cancel Order',
      text: 'Your Order has been cancelled',
      icon: 'success',
      confirmButtonText: 'Ok'
    }).then(()=>{
      window.location = link
    })
  }



function userlogout(event){
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "Are you going to logout?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'logout!',
        'logout successfully.',
        'success'
      ).then(()=>{
        window.location = link
      })
      
    }   else {
        return false;
      }
  })
}

//=======================USER SECTION JAVASCRIPT END ===================================

//=======================ADMIN SECTION JAVASCRIPT=======================================
function deleteuser(event){
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Deleted!',
          'This user has been deleted successfully.',
          'success'
        ).then(()=>{
          window.location = link
        })
        
      }   else {
          return false;
        }
    })
}
function blockuser(event){
    event.preventDefault();
    var link = event.currentTarget.href;
    Swal.fire({
      title: 'Block User',
      text: 'User has been blocked successfully',
      icon: 'success',
      confirmButtonText: 'Ok'
    }).then(()=>{
      window.location = link
    })
}

function unblockuser(event){
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Unblock User',
    text: 'User has been unblocked successfully',
    icon: 'success',
    confirmButtonText: 'Ok'
  }).then(()=>{
    window.location = link
  })
}

function deletefooditem(event){
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Deleted!',
        'This Food Item has been deleted successfully.',
        'success'
      ).then(()=>{
        window.location = link
      })
      
    }   else {
        return false;
      }
  })
}

function deletecategory(event){
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Deleted!',
        'This Category has been deleted successfully.',
        'success'
      ).then(()=>{
        window.location = link
      })
      
    }   else {
        return false;
      }
  })
}

function setbanner(event){
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Banner',
    text: 'This Banner updated successfully',
    icon: 'success',
    confirmButtonText: 'Ok'
  }).then(()=>{
    window.location = link
  })
}

function deletebanner(event){
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Deleted!',
        'This banner has been deleted successfully.',
        'success'
      ).then(()=>{
        window.location = link
      })
      
    }   else {
        return false;
      }
  })
}

function adminlogout(event){
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "Are you going to logout?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'logout!',
        'you logout successfully.',
        'success'
      ).then(()=>{
        window.location = link
      })
      
    }   else {
        return false;
      }
  })
}


//=======================ADMIN SECTION JAVASCRIPT END===================================