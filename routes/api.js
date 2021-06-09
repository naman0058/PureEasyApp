var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'category';
const fs = require("fs");


var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;



router.post('/index-category',(req,res)=>{
    var query = `select * from category order by id desc limit 6;`
    var query1 = `select sum(quantity) as counter from cart where usernumber ='${req.body.number}' and status is null;`
      var query2 = `select sum(c.price) as amount from cart c where 1 <= (select p.quantity from product p where p.id = c.booking_id ) and  c.usernumber = '${req.body.number}' and c.status is null;`
      var query3 = `select * from banner where type = 'Front Banner';`
      var query4 = `select  s.*,
                    (select su.name from subcategory su where su.id = s.subcategoryid) as subcategoryname, 
                    (select c.quantity from cart c where c.booking_id = s.id and c.usernumber = '${req.body.number}' and c.status is null  ) as userquantity,
                    (select si.name from size si where si.id = s.sizeid) as sizename
                     from product s order by id desc limit 5;`
      var query5 = `select * from banner where type = 'Bottom Banner';`
	pool.query(query+query1+query2+query3+query4+query5,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	});
});








router.post('/services1',(req,res)=>{
  var query = `select  s.*,
  (select su.name from subcategory su where su.id = s.subcategoryid) as subcategoryname, 
  (select c.quantity from cart c where c.booking_id = s.id and c.usernumber = '${req.body.number}' and c.status is null  ) as userquantity,
  (select si.name from size si where si.id = s.sizeid) as sizename
   from product s order by id desc limit 5;`
var query1 = `select sum(quantity) as counter from cart where usernumber ='${req.body.number}' and status is null;`
  var query2 = `select sum(c.price) as amount from cart c where 1 <= (select p.quantity from product p where p.id = c.booking_id ) and  c.usernumber = '${req.body.number}' and c.status is null;;`
  
pool.query(query+query1+query2,(err,result)=>{
    if(err) throw err;
    else res.json(result)
})
})



router.get('/',(req,res)=>{
    res.send('hi')
})


router.get('/allcategory',(req,res)=>{
	pool.query(`select * from category `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})



router.post('/subcategory',(req,res)=>{
      var query = `select s.* , (select c.name from category c where c.id = s.categoryid) as categoryname from subcategory s where s.categoryid = '${req.body.categoryid}';`
        var query1 = `select sum(quantity) as counter from cart where usernumber ='${req.body.number}' and status is null;`
      var query2 = `select sum(c.price) as amount from cart c where 1 <= (select p.quantity from product p where p.id = c.booking_id ) and  c.usernumber = '${req.body.number}' and c.status is null;;`
      pool.query(query+query1+query2,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})



router.post('/services',(req,res)=>{
      var query = `select  s.*,
                    (select su.name from subcategory su where su.id = s.subcategoryid) as subcategoryname, 
                    (select c.quantity from cart c where c.booking_id = s.id and c.usernumber = '${req.body.number}' and c.status is null  ) as userquantity,
                    (select si.name from size si where si.id = s.sizeid) as sizename
                     from product s where s.subcategoryid = '${req.body.subcategoryid}';`
   var query1 = `select sum(quantity) as counter from cart where usernumber ='${req.body.number}' and status is null;`
      var query2 = `select sum(c.price) as amount from cart c where 1 <= (select p.quantity from product p where p.id = c.booking_id ) and  c.usernumber = '${req.body.number}' and c.status is null;;`
      
    pool.query(query+query1+query2,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})















// Cart Api


// router.post('/cart',(req,res)=>{
//     let body = req.body;
//     pool.query(`select * from product where id = '${req.body.booking_id}'`,(err,result)=>{
//         if(err) throw err;
//         else {

//         }
//     })
// })


router.post("/cart", (req, res) => {
  let body = req.body;
  console.log(req.body);
        pool.query(
          `select * from product where id = "${req.body.booking_id}" `,
          (err, result) => {
            if (err) throw err;
            else {
              body["categoryid"] = result[0].categoryid;
              body["subcategoryid"] = result[0].subcategoryid;
              body["price"] = result[0].price;
              body["oneprice"] = result[0].price;
              body["quantity"] = "1";
              body["price"] = req.body.price;
              var qua = "1";
              pool.query(
                `select * from cart where usernumber = '${req.body.usernumber}'`,
                (err, result) => {
                  if (err) throw err;
                  else if (result[0]) {
                    if (req.body.categoryid == result[0].categoryid) {
                      if (req.body.booking_id == result[0].booking_id) {
                        pool.query(
                          `update cart set quantity = quantity+${qua} , price = price+${req.body.price} where booking_id = '${req.body.booking_id}' and usernumber = '${req.body.usernumber}'`,
                          (err, result) => {
                            if (err) throw err;
                            else {
                              res.json({
                                msg: "updated sucessfully",
                              });
                            }
                          }
                        );
                      } else {
                        pool.query(
                          `insert into cart set ?`,
                          body,
                          (err, result) => {
                            if (err) throw err;
                            else {
                              res.json({
                                msg: "updated sucessfully",
                              });
                            }
                          }
                        );
                      }
                    } else {
                    pool.query(
                      `insert into cart set ?`,
                      body,
                      (err, result) => {
                        if (err) throw err;
                        else {
                          res.json({
                            msg: "updated sucessfully",
                          });
                        }
                      }
                    );
                    }
                  } else {
                    pool.query(
                      `insert into cart set ?`,
                      body,
                      (err, result) => {
                        if (err) throw err;
                        else {
                          res.json({
                            msg: "updated sucessfully",
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      });

router.post("/cart/replace", (req, res) => {
  let body = req.body;
  console.log(req.body);
  pool.query(
    `select * from product where id = "${req.body.booking_id}" `,
    (err, result) => {
      if (err) throw err;
      else {
        body["categoryid"] = result[0].categoryid;
        body["subcategoryid"] = result[0].subcategoryid;
        body["price"] = result[0].price;
        body["oneprice"] = result[0].price;
        body["quantity"] = "1";
        body["price"] = req.body.price;

        pool.query(
          `delete from cart where usernumber = '${req.body.usernumber}'`,
          (err, result) => {
            if (err) throw err;
            else {
              pool.query(`insert into cart set ?`, body, (err, result) => {
                if (err) throw err;
                else {
                  res.json({
                    msg: "updated sucessfully",
                  });
                }
              });
            }
          }
        );
      }
    }
  );
});


router.post("/cart/all", (req, res) => {
    pool.query(
      `select * from cart where usernumber = '${req.body.usernumber}'`,
      (err, result) => {
        if (err) throw err;
        else res.json(result);
      }
    );
 
});

router.post("/mycart", (req, res) => {
 
    var query = `select c.*,(select s.name from product s where s.id = c.booking_id) as servicename
    ,(select s.image from product s where s.id = c.booking_id) as productlogo,
    (select s.quantity from product s where s.id = c.booking_id) as productquantity,
      (select si.name from size si where si.id = c.booking_id) as sizename
    from cart c where c.usernumber = '${req.body.usernumber}' and c.status is null;`
    var query1 = `select count(id) as counter from cart where usernumber = '${req.body.usernumber}' and status is null;`
    var query2 = `select sum(c.price) as total_ammount from cart c where c.quantity <= (select p.quantity from product p where p.id = c.booking_id ) and  c.usernumber = '${req.body.usernumber}' and c.status is null;`
    var query3 = `select c.*,(select s.name from product s where s.id = c.booking_id) as servicename
    ,(select s.image from product s where s.id = c.booking_id) as productlogo,
    (select s.quantity from product s where s.id = c.booking_id) as productquantity,
      (select si.name from size si where si.id = c.booking_id) as sizename
    from cart c where c.quantity <= (select p.quantity from product p where p.id = c.booking_id ) and c.usernumber = '${req.body.usernumber}' and c.status is null;`
    var query4 = `select count(id) as counter from cart c where c.quantity <= (select p.quantity from product p where p.id = c.booking_id ) and c.usernumber = '${req.body.usernumber}' and c.status is null`
    pool.query(query+query1+query2+query3+query4, (err, result) => {
      if (err) throw err;
      else if (result[0][0]) {
        req.body.mobilecounter = result[1][0].counter;
        console.log("MobileCounter", req.body.mobilecounter);
        res.json(result);
      } else
        res.json({
          msg: "empty cart",
        });
    });

});


router.post("/cartupdate", (req, res) => {
  if (process.env.encryptedkey == req.body.key) {
    pool.query(
      `select id,price,oneprice,quantity from cart where id = "${req.body.id}"`,
      (err, result) => {
        if (err) throw err;
        else {
          console.log(result[0]);
          pool.query(
            `update cart set price = price + oneprice , quantity = quantity+1  where id = "${req.body.id}"`,
            (err, result) => {
              err
                ? console.log(err)
                : res.json({
                    msg: "updated successfully",
                  });
            }
          );
        }
      }
    );
  } else {
    res.json({
      type: "error",
      description: "404 Not Found",
    });
  }
});

router.post("/cartdelete", (req, res) => {
  if (process.env.encryptedkey == req.body.key) {
    pool.query(
      `select id,price,quantity from cart where id = "${req.body.id}"`,
      (err, result) => {
        if (err) throw err;
        else if (result[0].quantity > 1) {
          console.log(result[0]);
          pool.query(
            `update cart set price = price - (price/quantity) , quantity = quantity-1  where id = "${req.body.id}"`,
            (err, result) => {
              err
                ? console.log(err)
                : res.json({
                    msg: "deleted successfully",
                  });
            }
          );
        } else {
          pool.query(
            `delete from cart where id = "${req.body.id}"`,
            (err, result) => {
              err
                ? console.log(err)
                : res.json({
                    msg: "deleted successfully",
                  });
            }
          );
        }
      }
    );
  } else {
    res.json({
      type: "error",
      description: "404 Not Found",
    });
  }
});



router.post('/signup',(req,res)=>{
    let body = req .body
    body['date'] = today
    pool.query(`select * from pincode where name = '${req.body.pincode}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
             pool.query(`select * from users where number  = '${req.body.number}'`,(err,result)=>{
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else if(result[0]) {
          res.json({
              status : 100,
              type:'failed',
              description : 'already registered'
          })
        }
        else{
         pool.query(`insert into users set ?`,body,(err,result)=>{
             if(err) {
                res.json({
                    status:500,
                    type : 'error',
                    description:err
                })
             }
             else {
                res.json({
                    status:200,
                    type : 'success',
                    description:'successfully registered'
                })
             }
         })
        }
    })
        }
        else {
            res.json({
                msg : 'area not covered'
            })
        }
    })
   
})





router.post('/check',(req,res)=>{
  pool.query(`select * from pincode where name = '${req.body.pincode}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
     res.json({
        msg : 'success'
    })
    }
    else {
      res.json({
        msg : 'area not covered'
    })
    }
  })
})



router.post('/running-orders',(req,res)=>{
	pool.query(`select * from booking where number = '${req.body.number}' and status!='completed' order by id desc `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})




router.post('/orders/history',(req,res)=>{
	pool.query(`select * from booking where number = '${req.body.number}' and status = 'completed' order by id desc `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})



router.post('/orders/cancel',(req,res)=>{
	pool.query(`select * from cancel_booking where number = '${req.body.number}' order by id desc `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})




router.post('/cancel-order',(req,res)=>{
    let body = req.body
                pool.query(`insert into cancel_booking set ?`,body,(err,result)=>{
        if(err) throw err;
        else {
            pool.query(`delete from booking where id = '${req.body.orderid}'`,(err,result)=>{
                if(err) throw err;
                else {
                    res.json({
                        msg : 'success'
                    })
                }
            })
        }
    })
})




router.post('/orders',(req,res)=>{
    let body = req.body;
    body['date'] = today
    body['status'] = 'pending'
    pool.query(`insert into booking set ?`,body,(err,result)=>{
        if(err) throw err;
        else {
          let insertId = result.insertId

          pool.query(`select * from cart c where c.quantity <= (select p.quantity from product p where p.id = c.booking_id ) and c.usernumber = '${req.body.number}' and c.status is null`,(err,result)=>{
            if(err) throw err;
            else {
          //    res.json(result)
              for(i=0;i<result.length;i++){
                let booking_id = result[i].booking_id
                pool.query(`update product set quantity = quantity - '${result[i].quantity}' where id = '${result[i].booking_id}'`,(err,result)=>{
                  if(err) throw err;
                  else {
                    pool.query(`update cart set status = 'booked' , orderid = '${insertId}' where usernumber = '${req.body.number}' and booking_id ='${booking_id}' and status is null`,(err,result)=>{
                      if(err) throw err;
                      else {
                           res.json({
                  msg :'success'
              })
                      }
                  })
                  }
                })
              }
            
            
            }
          })
           
           
        }
       
    })
})



router.get('/time',(req,res)=>{
    pool.query(`select * from time where date>= CURDATE()`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})







router.post("/cart-handler", (req, res) => {
        let body = req.body
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

})




router.post('/get-single-product-details',(req,res)=>{
    pool.query(`select * from product where id = '${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else res.json(result);
    })
})



router.post('/get-single-cancel-booking-details',(req,res)=>{
    
     var query = `select * from cancel_booking where id = '${req.body.id}';`
   var query1 = `select c.*,(select s.name from product s where s.id = c.booking_id) as servicename
    ,(select s.image from product s where s.id = c.booking_id) as productlogo,
      (select si.name from size si where si.id = c.booking_id) as sizename
    from cart c where c.usernumber = '${req.body.usernumber}' and orderid = '${req.body.orderid}';`
    var query2 = `select count(id) as counter from cart where usernumber = '${req.body.usernumber}' and orderid = '${req.body.orderid}';`
    var query3 = `select sum(price) as total_ammount from cart where usernumber = '${req.body.usernumber}'  and orderid = '${req.body.orderid}';`
    pool.query(query+query1+query2+query3,(err,result)=>{
        if(err) throw err;
        else res.json(result);
    })
   
    // pool.query(`select * from cancel_booking where id = '${req.body.id}'`,(err,result)=>{
    //     if(err) throw err;
    //     else res.json(result);
    // })
})



router.post('/get-single-booking-details',(req,res)=>{
    var query = `select * from booking where id = '${req.body.id}';`
   var query1 = `select c.*,(select s.name from product s where s.id = c.booking_id) as servicename
    ,(select s.image from product s where s.id = c.booking_id) as productlogo,
      (select si.name from size si where si.id = c.booking_id) as sizename
    from cart c where c.usernumber = '${req.body.usernumber}' and c.orderid = '${req.body.id}';`
    var query2 = `select count(id) as counter from cart where usernumber = '${req.body.usernumber}' and orderid = '${req.body.id}';`
    var query3 = `select sum(price) as total_ammount from cart where usernumber = '${req.body.usernumber}'  and orderid = '${req.body.id}';`
    pool.query(query+query1+query2+query3,(err,result)=>{
        if(err) throw err;
        else res.json(result);
    })
})



// router.post('/reorder',(req,res)=>{
//     let data  = []
    
    
//     if(req.body.status=='fromcancel'){
//          pool.query(`select categoryid , subcategoryid , booking_id , number  , amount  , name , address , pincode , quantity , orderid as id from cancel_booking where id = '${req.body.id}'`,(err,result)=>{
//         if(err) throw err;
//         else {
           
//               data  = result[0]
//            //    res.json(data)
//             data['status'] = 'pending'
//             data['time'] = req.body.time
//             data['order_date'] = today
//             data['date'] = req.body.date
            
//               pool.query(`insert into booking set ?`,data,(err,result)=>{
//         if(err) throw err;
//         else res.json({
//             msg :'success'
//         })
//     })
        
                
//         }
//     })
//     }
//     else {
//          pool.query(`select categoryid , subcategoryid , booking_id , number  , amount , status , name , address , pincode , quantity   from booking where id = '${req.body.id}'`,(err,result)=>{
//         if(err) throw err;
//         else {
           
//               data  = result[0]
//            //    res.json(data)
//             data['status'] = 'pending'
//             data['time'] = req.body.time
//             data['order_date'] = today
//             data['date'] = req.body.date
//               pool.query(`insert into booking set ?`,data,(err,result)=>{
//         if(err) throw err;
//         else res.json({
//             msg :'success'
//         })
//     })
        
                
//         }
//     })
//     }
    
   
// })























router.post('/reorder',(req,res)=>{
  let data  = []
    pool.query(`select usernumber , booking_id , categoryid , subcategoryid , price , quantity , oneprice from cart where orderid = '${req.body.id}'`,(err,result)=>{
          if(err) throw err;
          else {
            console.log('result nikla ',result[0])
              
               for(i=0;i<result.length;i++){

              pool.query(`insert into cart set ?`,result[i],(err,result)=>{
                if(err) throw err;
                console.log('result aaya ',result)
              })
            }
            res.json({msg:'success'})
           }
        })

})



// api create krni h booking data ki

// router.post("/get-booking-specification", (req, res) => {
//   pool.query(
//     `select booking_id from booking where id = '${req.body.id}'`,
//     (err, result) => {
//       if (err) throw err;
//       else {
//         let count = result[0].booking_id.split(",").length;
//         var array = result[0].booking_id.split(",");
//         res.json({
//           count: count,
//           result: array,
//         });
//         // console.log(result[0].booking_id)
//         //  console.log("Count : ",result[0].booking_id.split(",").length);
//         // var array = result[0].booking_id.split(',');
//         // console.log('array',array[0])
//       }
//     }
//   );
// });






router.post('/remove-all-data',(req,res)=>{
    pool.query(`delete from cart where usernumber = '${req.body.number}'`,(err,result)=>{
        if(err) throw err;
        else {
            res.json({
                msg : 'success'
            })
        }
    })
})






router.post('/remove-all-data-by-id',(req,res)=>{
    pool.query(`delete from cart where usernumber = '${req.body.number}' and id ='${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else {
            res.json({
                msg : 'success'
            })
        }
    })
})



module.exports = router;