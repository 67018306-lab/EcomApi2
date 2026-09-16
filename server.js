// Step 1 import ....
const express = require('express')
const app = express()
const morgan = require('morgan')
// เข้าไปอ่านใน folder routes import อัตโนมัต
const { readdirSync } = require('fs')
// ทำให้ srver กับ client สามารถติดต่าหากันได้
const cors = require('cors')

// ไม่ได้ใช้
// const authRouter = require('./routes/auth')
// const categoryRouter = require('./routes/category')

// middleware
app.use(morgan('dev'))
app.use(express.json({ limit: '20mb' }))
app.use(cors())

// ***ไม่ได้ใข้
// app.use('/api',authRouter)
// app.use('/api',categoryRouter)
// [ 'auth.js', 'category.js' ] ขึ้นไฟล์ตามสิ่งที่อยู่ใน routes 
// console.log(readdirSync('./routes'))

// มันเป็นการ import ลูป ใช้ทั้ง projact โดยการ map 
readdirSync('./routes')
    .map((c) => app.use('/api', require('./routes/' + c)))

// Step 3 Router ใช้ในการทดสอบ ไม่ได้ใช้
// app.post('/api',(req,res)=>{
//     // code
//     const { username,password } = req.body
//     console.log(username,password)
//     res.send('Jukkru 555+')
// })

// Step 2 Start Server
app.listen(5001,
    () => console.log('Server is running on port 5001'))  