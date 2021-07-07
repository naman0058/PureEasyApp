var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'category';
const fs = require("fs");
const fetch = require("node-fetch");

/* GET home page. */
router.get('/', function(req, res, next) {
 if(req.session.usernumber){
  var query = `select * from category order by id desc;`
  var query1 = `select * from banner where type = 'Front Banner' order by id desc;`
  var query2=` SELECT bannerid ,productid , (select t.name from promotional_text t where t.id = bannerid) as textname ,
  (select p.name from product p where p.id = productid) as productname,
  (select p.price from product p where p.id = productid) as productprice,
  (select p.quantity from product p where p.id = productid) as productquantity,
  (select p.discount from product p where p.id = productid) as productdiscount,
  (select p.image from product p where p.id = productid) as productimage,
  (select p.categoryid from product p where p.id = productid) as productcategoryid,
  (select p.subcategoryid from product p where p.id = productid) as productsubcategoryid,
  (select p.net_amount from product p where p.id = productid) as productnetamount
  
    FROM
     (SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY bannerid ORDER BY id DESC) as country_rank
       FROM promotional_text_management p) ranked
    WHERE country_rank <= 4 order by bannerid desc;`
  var query3 = `select * from promotional_text order by id desc;`
  var query4 = `select * from cart where usernumber = '${req.session.number}';`
  var query5 = `select * from banner where type = 'Bottom Banner' order by id desc;`

  pool.query(query+query1+query2+query3+query4+query5,(err,result)=>{
    if(err) throw err;
    else  res.render('index', { title: 'Express',result,login:true });
  })
 }
 else{
  var query = `select * from category order by id desc;`
  var query1 = `select * from banner order by id desc;`
  var query2=` SELECT bannerid ,productid , (select t.name from promotional_text t where t.id = bannerid) as textname ,
  (select p.name from product p where p.id = productid) as productname,
  (select p.price from product p where p.id = productid) as productprice,
  (select p.quantity from product p where p.id = productid) as productquantity,
  (select p.discount from product p where p.id = productid) as productdiscount,
  (select p.image from product p where p.id = productid) as productimage,
  (select p.categoryid from product p where p.id = productid) as productcategoryid,
  (select p.subcategoryid from product p where p.id = productid) as productsubcategoryid,
  (select p.net_amount from product p where p.id = productid) as productnetamount
  
    FROM
     (SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY bannerid ORDER BY id DESC) as country_rank
       FROM promotional_text_management p) ranked
    WHERE country_rank <= 4 order by bannerid desc;`
  var query3 = `select * from promotional_text order by id desc;`
  var query4 = `select * from cart where usernumber = '${req.session.number}';`
  var query5 = `select * from banner where type = 'Bottom Banner' order by id desc;`
  pool.query(query+query1+query2+query3+query4+query5,(err,result)=>{
    if(err) throw err;
    else  res.render('index', { title: 'Express',result,login:false });
  })
 }


 
});



router.get('/order-history',(req,res)=>{
  pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname from booking b where b.status =  'completed' order by id desc;`,(err,result)=>{
    if(err) throw err;
    else res.render('show-orders',{result:result})
  })
})


router.get('/running-order',(req,res)=>{
  pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname from booking b where b.status != 'completed' order by id desc;`,(err,result)=>{
    if(err) throw err;
    else res.render('show-orders',{result:result})
  })
})


router.get('/cancel-order',(req,res)=>{
  pool.query(`select  b.* , (select p.name from product p where p.id = b.booking_id) as productname from booking b where b.status = 'cancel' order by id desc `,(err,result)=>{
    if(err) throw err;
    else res.render('show-orders',{result:result})
  })
})



router.get('/purchase-report',(req,res)=>{
  pool.query(`select * from cancel_booking order by id desc `,(err,result)=>{
    if(err) throw err;
    else res.render('purchase-report',{result:result})
  })
})


router.get('/sales-report',(req,res)=>{
  pool.query(`select * from booking order by id desc `,(err,result)=>{
    if(err) throw err;
    else res.render('sales-report',{result:result})
  })
})


router.get('/stock-report',(req,res)=>{
  pool.query(`select p.* , (select c.name from category c where c.id = p.categoryid) as categoryname from product p order by quantity `,(err,result)=>{
    if(err) throw err;
    else res.render('sales-report',{result:result})
  })
})



















router.get('/shop',(req,res)=>{

if(req.session.usernumber){
  var query = `select * from category order by id desc;`
  var query1 = `select * from product where categoryid = '${req.query.categoryid}';`
  var query2 =  `select * from subcategory where categoryid = '${req.query.categoryid}';`

  pool.query(query+query1+query2,(err,result)=>{
    if(err) throw err;
    else if(result[1][0]) res.render('shop',{result:result,login:true})
    else  res.render('not_found',{result,login:true})
  })
}
else{
  var query = `select * from category order by id desc;`
  var query1 = `select * from product where categoryid = '${req.query.categoryid}';`
  var query2 =  `select * from subcategory where categoryid = '${req.query.categoryid}';`
  pool.query(query+query1+query2,(err,result)=>{
    if(err) throw err;
    else if(result[1][0]) res.render('shop',{result:result,login:true})
    else  res.render('not_found',{result,login:true})
  })
}

  
 
})




router.get('/shop/subcategory',(req,res)=>{

 pool.query(`select categoryid from subcategory where id = '${req.query.id}'`,(err,result)=>{
   if(err) throw err;
   else {
     let categoryid = result[0].categoryid

     if(req.session.usernumber){
      var query = `select * from category order by id desc;`
      var query1 = `select * from product where subcategoryid = '${req.query.id}';`
      var query2 =  `select * from subcategory where categoryid = '${categoryid}';`
    
      pool.query(query+query1+query2,(err,result)=>{
        if(err) throw err;
        else if(result[1][0]) res.render('shop',{result:result,login:true})
        else  res.render('not_found',{result,login:true})
      })
    }
    else{
      var query = `select * from category order by id desc;`
      var query1 = `select * from product where subcategoryid = '${req.query.id}';`
      var query2 =  `select * from subcategory where categoryid = '${rcategoryid}';`
      pool.query(query+query1+query2,(err,result)=>{
        if(err) throw err;
        else  res.render('shop',{result:result,login:false})
      })
    }
    


   }
 })


 
    
   
  })



router.get('/product',(req,res)=>{

pool.query(`select categoryid from product where id = '${req.query.id}'`,(err,result)=>{
  if(err) throw err;
  else {
    let categoryid = result[0].categoryid

    if(req.session.usernumber){
      var query = `select * from category order by id desc;`
      var query1 = `select p.* , 
      (select b.name from brand b where b.id = p.brandid) as brandname,
      (select si.name from size si where si.id = p.sizeid) as sizename
      from product p where p.id = '${req.query.id}';`
      var query3 = `select * from product order by id desc;`
      var query4 = `select * from product where categoryid = '${categoryid}' order by id desc limit 8;`
      pool.query(query+query1+query3+query4,(err,result)=>{
        if(err) throw err;
        else res.render('view-product', { title: 'Express',login:'true' , result : result});
      })
      
  
    }
    else{
      var query = `select * from category order by id desc;`
      var query1 = `select p.* , 
      (select b.name from brand b where b.id = p.brandid) as brandname,
      (select si.name from size si where si.id = p.sizeid) as sizename
      from product p where p.id = '${req.query.id}';`
      var query3 = `select * from product order by id desc;`
      var query4 = `select * from product where categoryid = '${categoryid}' order by id desc limit 8;`

      pool.query(query+query1+query3+query4,(err,result)=>{
        if(err) throw err;
        else res.render('view-product', { title: 'Express',login:'false' , result : result});
  
      })
  
    }

  }
})


})







router.post("/cart-handler", (req, res) => {
  let body = req.body
console.log('usern ka number',req.session.usernumber)

if(req.session.usernumber || req.session.usernumber!= undefined){
  body['usernumber'] = req.session.usernumber;

  console.log(req.body)
  if (req.body.quantity == "0" || req.body.quantity == 0) {
  pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
      if (err) throw err;
      else {
        res.json({
          msg: "updated sucessfully",
        });
      }
  })
  }
  else {
      pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
          if (err) throw err;
          else if (result[0]) {
             // res.json(result[0])
              pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}'`,(err,result)=>{
                  if (err) throw err;
                  else {
                      res.json({
                        msg: "updated sucessfully",
                      });
                    }

              })
          }
          else {
            body["price"] = (req.body.price)*(req.body.quantity)
               pool.query(`insert into cart set ?`, body, (err, result) => {
               if (err) throw err;
               else {
                 res.json({
                   msg: "updated sucessfully",
                 });
               }
             });

          }

      })
  }
}
else {



  if(req.session.ipaddress){
    body['usernumber'] = req.session.ipaddress;

    console.log(req.body)
    if (req.body.quantity == "0" || req.body.quantity == 0) {
    pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
        if (err) throw err;
        else {
          res.json({
            msg: "updated sucessfully",
          });
        }
    })
    }
    else {
        pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
            if (err) throw err;
            else if (result[0]) {
               // res.json(result[0])
                pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}'`,(err,result)=>{
                    if (err) throw err;
                    else {
                        res.json({
                          msg: "updated sucessfully",
                        });
                      }
  
                })
            }
            else {
              body["price"] = (req.body.price)*(req.body.quantity)
                 pool.query(`insert into cart set ?`, body, (err, result) => {
                 if (err) throw err;
                 else {
                   res.json({
                     msg: "updated sucessfully",
                   });
                 }
               });
  
            }
  
        })
    }
  


  }

  else {

    var otp =   Math.floor(100000 + Math.random() * 9000);
    req.session.ipaddress = otp;
    body['usernumber'] = otp;
    console.log(req.body)
    if (req.body.quantity == "0" || req.body.quantity == 0) {
    pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
        if (err) throw err;
        else {
          res.json({
            msg: "updated sucessfully",
          });
        }
    })
    }
    else {
        pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
            if (err) throw err;
            else if (result[0]) {
               // res.json(result[0])
                pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}'`,(err,result)=>{
                    if (err) throw err;
                    else {
                        res.json({
                          msg: "updated sucessfully",
                        });
                      }
  
                })
            }
            else {
              body["price"] = (req.body.price)*(req.body.quantity)
                 pool.query(`insert into cart set ?`, body, (err, result) => {
                 if (err) throw err;
                 else {
                   res.json({
                     msg: "updated sucessfully",
                   });
                 }
               });
  
            }
  
        })
    }
  


  }


 

}



})




router.get('/mycart',(req,res)=>{

 console.log(req.session.ipaddress)

  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select c.* , 
    (select p.name from product p where p.id = c.booking_id) as bookingname,
    (select p.image from product p where p.id = c.booking_id) as bookingimage,
    (select p.quantity from product p where p.id = c.booking_id) as availablequantity
    

    
     from cart c where c.usernumber = '${req.session.usernumber}';`
   var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`              


    pool.query(query+query1+query2,(err,result)=>{
      if(err) throw err;
      else{
       res.render('cart', { title: 'Express',login:'true',result });
   
      }
   
   
       })

  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select c.* , 
    (select p.name from product p where p.id = c.booking_id) as bookingname,
    (select p.image from product p where p.id = c.booking_id) as bookingimage,
    (select p.quantity from product p where p.id = c.booking_id) as availablequantity

    
     from cart c where c.usernumber = '${req.session.ipaddress}';`
   var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.ipaddress}';`              

    pool.query(query+query1+query2,(err,result)=>{
      if(err) throw err;
      else{
       res.render('cart', { title: 'Express',login:'false',result });
   
      }
   
   
       })

  }
})





router.get('/delete',(req,res)=>{
  if(req.session.usernumber){
  pool.query(`delete from cart where id = '${req.query.id}' and usernumber = '${req.session.usernumber}'`,(err,result)=>{
  if(err) throw err;
  else res.redirect('/mycart')
  })
  }
  else {
    pool.query(`delete from cart where id = '${req.query.id}' and usernumber = '${req.session.ipaddress}'`,(err,result)=>{
      if(err) throw err;
      else res.redirect('/mycart')
      })
  }
})





router.get('/checkout',(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
   
   var query1 = `select c.* ,
                (select p.name from product p where p.id = c.booking_id) as bookingname
                from cart c where c.usernumber = '${req.session.usernumber}';`
   var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`              
   

    pool.query(query+query1+query2,(err,result)=>{
      if(err) throw err;
      else {
        req.session.totalprice = result[2][0].totalprice
        res.render('checkout', { title: 'Express',login:'true' , result : result });
      } 
    })
   

  }
  else{
    req.session.page = '1'
    res.redirect('/login')
  }
})












router.post('/order-now',(req,res)=>{
  let body = req.body;
// console.log('body',req.body)
  let cartData = req.body

  console.log('CardData',cartData)
  if(req.body.payment_mode == 'online') {

    req.session.userfirstname =  req.body.first_name;
    req.session.userlastname = req.body.last_name;
    req.session.address1 = req.body.address1;
    req.session.address2 = req.body.address2;
    req.session.city = req.body.city;
    req.session.state = req.body.state;
    req.session.pincode = req.body.pincode;
    req.session.time = req.body.time;
    req.session.payment_mode = req.body.payment_mode;
   
   


    const url = `https://rzp_live_wdTkjI7Ba4b5qN:rxR0Prlwb9Gz7HctbrpukFOe@api.razorpay.com/v1/orders/`;
    const data = {
      amount: 1 * 100, // amount in the smallest currency unit
      //amount:100,
      currency: "INR",
      payment_capture: true,
    };
    console.log("data", data);
    const options = {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };
    fetch(url, options)
      .then((res) => res.json())
      .then((resu) => {
           res.render('open',{resu : resu.id})
      })

  }
  else{


    console.log('CardData',cartData)

       body['status'] = 'pending'
        
    
      var today = new Date();
    var dd = today.getDate();
    
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
      dd='0'+dd;
    } 
    
    if(mm<10) 
    {
      mm='0'+mm;
    } 
    today = yyyy+'-'+mm+'-'+dd;
    
    
    body['date'] = today
    
    
    
      var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var result = '';
      for ( var i = 0; i < 12; i++ ) {
          result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
     orderid = result;
    
    
        body['address'] = req.body.address1 + ',' + req.body.address2 + ',' + req.body.city + ',' + req.body.state + ',' + req.body.pincode;
        body['name'] = req.body.first_name + ' ' + req.body.last_name ;
    
    
     console.log(req.body)
    
    
     pool.query(`select * from cart where usernumber = '${req.session.usernumber}'`,(err,result)=>{
         if(err) throw err;
         else {
    
         let data = result
    
         for(i=0;i<result.length;i++){
          data[i].name = req.body.name
          data[i].date = today
          data[i].orderid = orderid
          data[i].status = 'pending'
          data[i].number = req.session.usernumber
          data[i].usernumber = req.session.usernumber
          data[i].payment_mode = 'cash'
          data[i].address = req.body.address
          data[i].id = null
          data[i].pincode = req.body.pincode
          data[i].order_date = today
    
    
         }
    
    
       
    
    for(i=0;i<data.length;i++) {
      console.log('quantity1',data[i].quantity)
    
    let quantity = data[i].quantity;
    let booking_id = data[i].booking_id;
    
     pool.query(`insert into booking set ?`,data[i],(err,result)=>{
             if(err) throw err;
             else {
        
    
    pool.query(`update product set quantity = quantity - ${quantity} where id = '${booking_id}'`,(err,result)=>{
     if(err) throw err;
     else {
    
     }
    
    })
    
             }
        })
    }
    
    
      
    
    
    pool.query(`delete from cart where usernumber = '${req.session.usernumber}'`,(err,result)=>{
      if(err) throw err;
      else {
         res.redirect('/myorder')
      }
    })
    
    
         }
     })

  }

  

 
})





router.get('/myorder',(req,res)=>{
  if(req.session.usernumber){
    req.session.page = null;
    var query = `select * from category order by id desc;`
    var query1 = `select b.* , (select p.name from product p where p.id = b.booking_id) as bookingname,
    (select p.image from product p where p.id = b.booking_id) as bookingimage
    from booking b where usernumber = '${req.session.usernumber}' order by id desc `
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else res.render('myorder',{result:result,login:true})
    })
  }
  else{
    req.session.page = null;
  res.redirect('/login')
  }
 
})





router.get('/myorder/cancel',(req,res)=>{
  pool.query(`update booking set status = 'cancel' where id = '${req.query.orderid}'`,(err,result)=>{
      if(err) throw err;
      else res.redirect('/myorder')
  })
})





router.get('/search',(req,res)=>{

if(req.session.usernumber){
  var query = `select * from category order by id desc;`
  var query1 = `select * from product where keywords Like '%${req.query.search}%';`
  pool.query(query+query1,(err,result)=>{
    if(err) throw err;
    else if(result[1][0]){
      res.render('shop1',{result:result,login:true})
    }
    else res.send('no')
  })
}
else{
  var query = `select * from category order by id desc;`
  var query1 = `select * from product where keywords Like '%${req.query.search}%';`
  pool.query(query+query1,(err,result)=>{
    if(err) throw err;
    else if(result[1][0]){
      res.render('shop1',{result:result,login:false})
    }
    else res.send('no')
  })
}

  
 
})







router.get('/website-customization',(req,res)=>{
  res.render('website_customization')
})



router.get('/faq-customization',(req,res)=>{
  res.render('faq_customization')
})




router.post('/faq-insert',(req,res)=>{
  let body = req.body
  pool.query(`insert into faq set ?`,body,(err,result)=>{
    if(err) throw err;
    else res.json({
      msg : 'success'
    })
  })
})



router.post('/website-customization-insert',(req,res)=>{
  let body = req.body   
  pool.query(`select * from website_customize where name = '${req.body.name}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
      res.json({
        msg : 'Already Inserted'
      })
    }
    else {
      pool.query(`insert into website_customize set ?`,body,(err,result)=>{
        if(err) throw err;
        else res.json({
          msg : 'success'
        })
      })
    }
  })
})




router.get('/view-all-product',(req,res)=>{


  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select t.* ,   
    (select p.name from product p where p.id = t.productid) as productname,
    (select p.price from product p where p.id = t.productid) as productprice,
    (select p.quantity from product p where p.id = t.productid) as productquantity,
    (select p.discount from product p where p.id = t.productid) as productdiscount,
    (select p.image from product p where p.id = t.productid) as productimage,
    (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from product p where p.id = t.productid) as productnetamount 
    from promotional_text_management t where t.bannerid = '${req.query.id}' `
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else if(result[1][0]) res.render('view_all_product',{result:result,login:true})
      else  res.render('not_found',{result,login:true})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select t.* ,   
    (select p.name from product p where p.id = t.productid) as productname,
    (select p.price from product p where p.id = t.productid) as productprice,
    (select p.quantity from product p where p.id = t.productid) as productquantity,
    (select p.discount from product p where p.id = t.productid) as productdiscount,
    (select p.image from product p where p.id = t.productid) as productimage,
    (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from product p where p.id = t.productid) as productnetamount 
    from promotional_text_management t where t.bannerid = '${req.query.id}' ;`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else  res.render('view_all_product',{result:result,login:false})
    })
  }
  

 
})




router.get('/banner-product',(req,res)=>{


  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select t.* ,   
    (select p.name from product p where p.id = t.productid) as productname,
    (select p.price from product p where p.id = t.productid) as productprice,
    (select p.quantity from product p where p.id = t.productid) as productquantity,
    (select p.discount from product p where p.id = t.productid) as productdiscount,
    (select p.image from product p where p.id = t.productid) as productimage,
    (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from product p where p.id = t.productid) as productnetamount 
    from banner_manage t where t.bannerid = '${req.query.id}' `
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else if(result[1][0]) res.render('view_all_product',{result:result,login:true})
      else  res.render('not_found',{result,login:true})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select t.* ,   
    (select p.name from product p where p.id = t.productid) as productname,
    (select p.price from product p where p.id = t.productid) as productprice,
    (select p.quantity from product p where p.id = t.productid) as productquantity,
    (select p.discount from product p where p.id = t.productid) as productdiscount,
    (select p.image from product p where p.id = t.productid) as productimage,
    (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from product p where p.id = t.productid) as productnetamount 
    from banner_manage t where t.bannerid = '${req.query.id}' ;`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else if(result[1][0]) res.render('view_all_product',{result:result,login:true})
      else  res.render('not_found',{result,login:true})
    })
  }
  
})



router.get('/myaccount',(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select * from booking where usernumber = '${req.session.usernumber}' order by id desc;`

    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else res.render('myaccount',{result:result,login:true})
    })
  }
  else{
 res.redirect('/login')
  }
  
})




router.get('/about',(req,res)=>{
  if(req.session.usernumber) {
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'about';`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
     
      else res.render('website_customize',{result,login:true})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'about' ;`

    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else res.render('website_customize',{result,login:false})
    })
  }
})








router.get('/privacy-policy',(req,res)=>{
  if(req.session.usernumber) {
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'pp';`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
     
      else res.render('website_customize',{result,login:true})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'pp' ;`

    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else res.render('website_customize',{result,login:false})
    })
  }
})




router.get('/terms-and-conditions',(req,res)=>{
  if(req.session.usernumber) {
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'tc';`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
     
      else res.render('website_customize',{result,login:true})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'tc' ;`

    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else res.render('website_customize',{result,login:false})
    })
  }
})








router.get('/refund-policy',(req,res)=>{
  if(req.session.usernumber) {
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'rp';`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
     
      else res.render('website_customize',{result,login:true})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from website_customize where name = 'rp' ;`

    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else res.render('website_customize',{result,login:false})
    })
  }
})












router.post('/razorpay-response',(req,res)=>{
  let body = req.body;

 body['first_name'] =  req.session.userfirstname ;
 body['last_name'] =    req.session.userlastname ;
  body['address1'] =   req.session.address1 ;
  body['address2'] = req.session.address2;
  body['city'] = req.session.city;
  body['state'] = req.session.state;
  body['pincode'] = req.session.pincode;
  body['time'] = req.session.time;
  body['payment_mode'] = req.session.payment_mode

   
   

// console.log('body',req.body)
  let cartData = req.body

  console.log('CardData',cartData)
  
  


    console.log('CardData',cartData)

       body['status'] = 'pending'
        
    
      var today = new Date();
    var dd = today.getDate();
    
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
      dd='0'+dd;
    } 
    
    if(mm<10) 
    {
      mm='0'+mm;
    } 
    today = yyyy+'-'+mm+'-'+dd;
    
    
    body['date'] = today
    
    
    
      var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var result = '';
      for ( var i = 0; i < 12; i++ ) {
          result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
     orderid = result;
    
    
        body['address'] = req.body.address1 + ',' + req.body.address2 + ',' + req.body.city + ',' + req.body.state + ',' + req.body.pincode;
        body['name'] = req.body.first_name + ' ' + req.body.last_name ;
    
    
     console.log(req.body)
    
    
     pool.query(`select * from cart where usernumber = '${req.session.usernumber}'`,(err,result)=>{
         if(err) throw err;
         else {
    
         let data = result
    
         for(i=0;i<result.length;i++){
          data[i].name = req.body.name
          data[i].date = today
          data[i].orderid = orderid
          data[i].status = 'pending'
          data[i].number = req.session.usernumber
          data[i].usernumber = req.session.usernumber
          data[i].payment_mode = 'cash'
          data[i].address = req.body.address
          data[i].id = null
          data[i].pincode = req.body.pincode
          data[i].order_date = today
          data[i].razorpay_order_id = req.body.razorpay_order_id
    
    
         }
    
    
       
    
    for(i=0;i<data.length;i++) {
      console.log('quantity1',data[i].quantity)
    
    let quantity = data[i].quantity;
    let booking_id = data[i].booking_id;
    
     pool.query(`insert into booking set ?`,data[i],(err,result)=>{
             if(err) throw err;
             else {
        
    
    pool.query(`update product set quantity = quantity - ${quantity} where id = '${booking_id}'`,(err,result)=>{
     if(err) throw err;
     else {
    
     }
    
    })
    
             }
        })
    }
    
    
      
    
    
    pool.query(`delete from cart where usernumber = '${req.session.usernumber}'`,(err,result)=>{
      if(err) throw err;
      else {
         res.redirect('/myorder')
      }
    })
    
    
         }
     })

  

  

 
})




router.get('/logout',(req,res)=>{
  req.session.usernumber = null;
  res.redirect('/')
})


module.exports = router;
