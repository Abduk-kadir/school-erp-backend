const asyncHandler=require('express-async-handler')
const  {errorlogs}=require('../models')


const getallErrorLogs=asyncHandler(async(req,res)=>{

    const errorLogs=await errorlogs.findAll({raw:true})
    res.status(200).json({success:true,data:errorLogs})

   
  
})
module.exports={getallErrorLogs}