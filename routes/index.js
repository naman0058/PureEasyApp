var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'category';
const fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
 if(req.session.usernumber){
  var query = `select * from category order by id desc;`
  var query1 = `select * from category;`
  var query2=` SELECT *
  FROM
   (SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY categoryid ORDER BY id DESC) as country_rank
     FROM product) ranked
  WHERE country_rank <= 10;`
  pool.query(query+query1+query2,(err,result)=>{
    if(err) throw err;
    else  res.render('index', { title: 'Express',result,login:true });
  })
 }
 else{
  var query = `select * from category order by id desc;`
  var query1 = `select * from category;`
  var query2=` SELECT *
  FROM
   (SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY categoryid ORDER BY id DESC) as country_rank
     FROM product) ranked
  WHERE country_rank <= 10;`
  pool.query(query+query1+query2,(err,result)=>{
    if(err) throw err;
    else  res.render('index', { title: 'Express',result,login:false });
  })
 }


 
});









router.get('/order-history',(req,res)=>{
  pool.query(`select * from booking where status = 'completed' order by id desc;`,(err,result)=>{
    if(err) throw err;
    else res.render('show-orders',{result:result})
  })
})


router.get('/running-order',(req,res)=>{
  pool.query(`select * from booking where status != 'completed' order by id desc;`,(err,result)=>{
    if(err) throw err;
    else res.render('show-orders',{result:result})
  })
})


router.get('/cancel-order',(req,res)=>{
  pool.query(`select * from cancel_booking order by id desc `,(err,result)=>{
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
  pool.query(query+query1,(err,result)=>{
    if(err) throw err;
    else  res.render('shop',{result:result,login:true})
  })
}
else{
  var query = `select * from category order by id desc;`
  var query1 = `select * from product where categoryid = '${req.query.categoryid}';`
  pool.query(query+query1,(err,result)=>{
    if(err) throw err;
    else  res.render('shop',{result:result,login:false})
  })
}

  
 
})





router.get('/product',(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select p.* , 
    (select b.name from brand b where b.id = p.brandid) as brandname,
    (select si.name from size si where si.id = p.sizeid) as sizename
    from product p where p.id = '${req.query.id}';`
    var query3 = `select * from product order by id desc;`
    pool.query(query+query1+query3,(err,result)=>{
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
    pool.query(query+query1+query3,(err,result)=>{
      if(err) throw err;
      else res.render('view-product', { title: 'Express',login:'false' , result : result});

    })

  }
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
    (select p.name from product p where p.id = c.booking_id) as bookingname
    
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
    (select p.name from product p where p.id = c.booking_id) as bookingname
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





router.get('/checkout',(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
   
   var query1 = `select c.* ,
                (select p.name from product p where p.id = c.booking_id) as bookingname
                from cart c where c.usernumber = '${req.session.usernumber}';`
   var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`              
   

    pool.query(query+query1+query2,(err,result)=>{
      if(err) throw err;
      else  res.render('checkout', { title: 'Express',login:'true' , result : result });
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


//  console.log('CardData',cartData)

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

 
})





router.get('/myorder',(req,res)=>{
  if(req.session.usernumber){
    req.session.page = null;
    var query = `select * from category order by id desc;`
    var query1 = `select b.* , (select p.name from product p where p.id = b.booking_id) as bookingname
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







router.get('/search',(req,res)=>{

if(req.session.usernumber){
  var query = `select * from category order by id desc;`
  var query1 = `select * from product where keyword Like '%${req.query.search}%';`
  pool.query(query+query1,(err,result)=>{
    if(err) throw err;
    else if(result[1][0]){
      res.render('shop',{result:result,login:true})
    }
    else res.send('no')
  })
}
else{
  var query = `select * from category order by id desc;`
  var query1 = `select * from product where keyword Like '%${req.query.search}%';`
  pool.query(query+query1,(err,result)=>{
    if(err) throw err;
    else if(result[1][0]){
      res.render('shop',{result:result,login:false})
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

module.exports = router;
