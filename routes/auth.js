// ทำต่อจาก server
// import ....
const express = require('express')
const router = express.Router()
// import controller (หลายฟังก์ชั้น)
const { register, login, currentUser} = require('../controllers/auth')
// // import Middleware
const { authCheck, adminCheck } = require('../middlewares/authCheck')

// เอาไว้ต่อใน controller
router.post('/register', register)
router.post('/login', login)
//  เอาใชไว้สำหรับเช็ค Authen
router.post('/current-user', authCheck, currentUser)
router.post('/current-admin',authCheck, adminCheck, currentUser)

// ทกสอบการใข้งาน
// router.get('/register',(req,res)=>{
//     // code...
//     res.send('Hello Register')
// })
 
module.exports = router