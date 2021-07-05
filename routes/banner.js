var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'banner';
const fs = require("fs");
const app = require('../app');
const { json } = require('express');



router.get('/',(req,res)=>{
    if(req.session.adminid){
        res.render('banner')
    }
    else {
        res.render('admin_login',{msg:'Please Login First'})
    }
  // res.render('category')
    
})








router.get('/management',(req,res)=>{
    if(req.session.adminid){
        pool.query(`select * from product order by name desc`,(err,result)=>{
            if(err) throw err;
            else res.render('banner_management',{result})
        })
        
    }
    else {
        res.render('admin_login',{msg:'Please Login First'})
    }
  // res.render('category')
    
})



router.post('/storeEditId',(req,res)=>{
    req.session.editStoreId = req.body.id
    res.send('success')
})


router.post('/insert',upload.single('image'),(req,res)=>{
	let body = req.body
    body['image'] = req.file.filename;
	pool.query(`insert into ${table} set ?`,body,(err,result)=>{
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
                description:'successfully added'
            })
            
        }
	})
})



router.get('/all',(req,res)=>{
	pool.query(`select * from ${table} `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})



router.get('/delete', (req, res) => {
    let body = req.body
    pool.query(`delete from ${table} where id = ${req.query.id}`, (err, result) => {
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
                description:'successfully delete'
            })
        }
    })
})


router.post('/update', (req, res) => {
    pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
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
                description:'successfully update'
            })

            
        }
    })
})







router.post('/update_image',upload.single('image'), (req, res) => {
    let body = req.body;
    body['image'] = req.file.filename


    pool.query(`select image from ${table} where id = '${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else {
            fs.unlinkSync(`public/images/${result[0].image}`); 


 pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            // res.json({
            //     status:200,
            //     type : 'success',
            //     description:'successfully update'
            // })

            res.redirect('/banner')
        }
    })


        }
    })

  
   
})


router.post('/management/insert',(req,res)=>{
    let body = req.body;
    console.log(req.body)

    let c = JSON.parse(req.body.b)

    console.log('c',c)
    for(i=0;i<c.length;i++){
        let d = c[i]
        pool.query(`select * from banner_manage where bannerid = '${req.body.bannerid}' and productid = '${d}'`,(err,result)=>{
            if(err) throw err;
            else if(result[0]) {
                           
            }
            else{
                pool.query(`insert into banner_manage(bannerid , productid) values('${req.body.bannerid}' , '${d}')`,(err,result)=>{
                    if(err) throw err;
                    else {

                    }
                })
            }
        })
    }
    res.json({
        msg : 'success'
    })
})



module.exports = router;