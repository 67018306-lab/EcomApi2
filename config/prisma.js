// การเชื่อมต่อกับฐานข้อมูล DB
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = prisma