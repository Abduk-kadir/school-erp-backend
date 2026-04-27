const {getallErrorLogs}=require('../controllers/errorCheckController')
const express=require('express')
const router=express.Router()

router.get('/error-check',getallErrorLogs)
module.exports=router
