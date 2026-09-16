const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


// เอาไว้ตรวจสอบเชื่อมต่อที่ POSTMAN บันทึกลง DB ดูใน User ของ workben
exports.register = async(req, res) => {
    // code 
    try{
        // code...
        // Step 1 Validate body
        // ส่งค่าเช็คการทำงานของ Email, password
        const { email, password } = req.body
        if (!email) {
            return res.status(400).json({ message: 'Email is required!!!' })
        } if (!password) {
            return res.status(400).json({ message: "Password is required!!!" })
        }

        // Step 2 Check Email in DB already ? เช็คข้อมูลในฐานข้อมูล ใช้ postman
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if (user) {
            return res.status(400).json({ message: "Email already exits!!" })
        }

        // Step 3 HashPassword ,10 เป็นการสร้างรหัสมาแบบมั้วๆ
        const hashPassword = await bcrypt.hash(password, 10)
        
        // Step 4 Register
        await prisma.user.create({
            data: {
                email: email,
                password: hashPassword
            }
        })
        
        
        // ตรวจสอบการเข้ารหัส
        // console.log(hashPassword)        
        // console.log( user ) 
        res.send('Register Success') 
    }catch (err) {
        // Error
         console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

// ส่วนของการ login และได้รับ Token มาสามารถคัดลอกไปเปิดใน jwt.io และกำหนดระยะเวลาของการเช้าระบบ
exports.login = async(req, res) => {
    // code 
    try{
        // code...
        const { email, password } = req.body
        // Step 1 Check Email
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if (!user || !user.enabled) {
            return res.status(400).json({ message: 'User Not found or not Enabled' })
        }
        // Step 2 Check password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Password Invalid!!!' })
        }
        // Step 3 Create Payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        // Step 4 Generate Token
        jwt.sign(payload, process.env.SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) {
                return res.status(500).json({ message: "Server Error" })
            }
            res.json({ payload, token })
        })
        
        // ตรวจสอบ login และ payload
        // console.log(email, password)
        // console.log(payload)
        // res.send('Hello LOGIN IN Controller') 
    }catch (err) {
        // Error
         console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.currentUser = async (req, res) => {
    try {
        //code
        const user = await prisma.user.findFirst({
        where: { email: req.user.email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        })
        res.json({ user })
        // ตรงจสอบ..
        // res.send('Hello currenUser IN Controller') 
    } catch (err) {
        //err
        console.log(err)
        res.status(500).json({ message: 'Server Error' })
    }
}

