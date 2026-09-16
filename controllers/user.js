const prisma = require("../config/prisma");

// การป้องกัน User ไว้ปิดกั้นรหัสผู้ใช้
exports.listUsers = async (req, res) => {
  try {
    //code
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        address: true,
      },
    });
    res.json(users);
    // ตรวจสอบ
    // res.send('Hello User')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// เปลี่ยนสถานะของผู้ใช้งาน
exports.changeStatus = async (req, res) => {
  try {
    //code
    const { id, enabled } = req.body;
    console.log(id, enabled);
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { enabled: enabled },
    });

    res.send("Update Status Success");
    // ตรวจสอบ
    // res.send("Hello Chrangstatus");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// บทบาทเปลี่ยน แอดทิน กับ ยูสเซอร์
exports.changeRole = async (req, res) => {
  try {
    //code
    const { id, role } = req.body;
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: role },
    });

    res.send("Update Role Success");
    // ตรวจสอบ
    // res.send("HEllo changrole");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// -----------------------------------------------------------------------------------------------------
// 
exports.userCart = async (req, res) => {
  try {
    //code...
    // ตรวจสอบ...
    // res.send('Hello userChart')
    // ของในตละกล้า + จำนวน
    const { cart } = req.body;
    console.log(cart);
    console.log(req.user.id);

    const user = await prisma.user.findFirst({
      where: { id: Number(req.user.id) },
    });
    // console.log(user)

    // Check quantity 
    for (const item of cart) {
      // console.log(item)
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { quantity: true, title: true },
      });
      // console.log(item)
      // console.log(product)
      if (!product || item.count > product.quantity) {
        return res.status(400).json({
          ok: false,
          message: `ขออภัย. สินค้า ${product?.title || "product"} หมด`,
        });
      }
    }
// -----------------------------เคีลยร์สินค้า---------------------------------------------------------------------------------
    // Deleted old Cart item ลบสินค้าเก่าเพิมสินค้าใหม่ลบหลายอย่าง สั่งลบสั่งเคลียนร์ข้อมูลเดิม
    await prisma.productOnCart.deleteMany({
      where: {
        cart: {
          orderedById: user.id,
        },
      },
    });
    // Deeted old Cart 
    await prisma.cart.deleteMany({
      where: { orderedById: user.id },
    });
// -----------------------------เคีลยร์สินค้า---------------------------------------------------------------------------------
    // เตรียมสินค้า
    let products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));
    
    // หาผลรวม
    let cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );
    
    
    // New cart
    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products,
        },
        cartTotal: cartTotal,
        orderedById: user.id,
      },
    });
    console.log(newCart);
    res.send("Add Cart Ok");
    // 
    console.log(newCart)
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// -------------------------------------------------------------------------------------------------------

// ดึงข้อมูลในตละกล้าสินค้าออกมา
exports.getUserCart = async (req, res) => {
  try {
    //code
    // res.send('Hello getUserchart')
    // req.user.id
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    // console.log(cart);
    // res.send(cart)
    // เป็นการส่งข้อมูลไปบอกหน้าบ้าน
    res.json({
      products: cart.products,
      cartTotal: cart.cartTotal,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// เคีลยร์ข้อมูลในตละกล้าสินค้า
exports.emptyCart = async (req, res) => {
  try {
    //code
    res.send('hello emptychart')
    // หาตะหล้าที่จะลบ
    const cart = await prisma.cart.findFirst({
      where: { orderedById: Number(req.user.id) },
    });
    if (!cart) {
      return res.status(400).json({ message: "No cart" });
    }
    // ลบหลายๆ
    await prisma.productOnCart.deleteMany({
      where: { cartId: cart.id },
    });
    // 
    const result = await prisma.cart.deleteMany({
      where: { orderedById: Number(req.user.id) },
    });

    console.log(result);
    res.json({
      message: "Cart Empty Success",
      deletedCount: result.count,
    });
    // ตรวจสอบ
    // console.log(cart)
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 
exports.saveAddress = async (req, res) => {
  try {
    //code...
    const { address } = req.body;
    console.log(address);
    const addresssUser = await prisma.user.update({
      where: {
        id: Number(req.user.id),
      },
      data: {
        address: address,
      },
    });

    res.json({ ok: true, message: "Address update success" });
    // ตรวจสอบ
    // res.send('hello saveAddress')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// -----------------------------------------------------------------------------------------
// 
exports.saveOrder = async (req, res) => { 
  try {
    //code...

    // Step 0 Check Stripe การหาตะกล้า
    // console.log(req.body)
    // return res.send('hello Jukkru!!!')
    // stripePaymentId String
    // amount          Int
    // status          String
    // currentcy       String
    const { id, amount, status, currency } = req.body.paymentIntent;

    // Step 1 Get User Cart การหาตะกล้า
    const userCart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: { products: true },
    });
    
    // Check Cart empty
    // เช็คสินค้าในตะกล้า
    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ ok: false, message: "Cart is Empty" });
    }
    // console.log(userCart)



    // ---- ไม่มีในโค้ดปกติเดี๋บวย้ายไป userCart ในหน้าเดียวกัน
    // เป็นการแข้งว่าสินค้าไหนหมด
    // for(const item of userCart.products){
    //   // console.log(item)
    //   // เป็นการแจ้งว่าสินค้าไหนหมด
    //   const product = await prisma.product.findUnique({
    //     where: { id: item.productId },
    //     select: { quantity: true, title: true }
    //   })
    //   // console.log(item)
    //   // console.log(product)
    // // เป็นการแข้งว่าสินค้าไหนหมด
    //   if(!product || item.count > product.quantity){
    //     return res.status(400).json({
    //       ok:false,
    //       message: ` ขออภัย. สินค้า ${product?.title || `product` } หมด `
    //     })
    //   }
    // }
    // -------

    const amountTHB = Number(amount) / 100;
// 
    // Create a new Order
    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: { id: req.user.id },
        },
        cartTotal: userCart.cartTotal, 
        stripePaymentId: id,
        amount: amountTHB,
        // amount: Number(amount), 
        status: status,
        currentcy: currency,
      },
    });

    // console.log(order)
    // stripePaymentId String
    // amount          Int
    // status          String
    // currentcy       String

    // Update Product
    const update = userCart.products.map((item) => ({
      where: { id: item.productId },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count },
      },
    }));
    console.log(update);
    // promise 
    await Promise.all(update.map((updated) => prisma.product.update(updated)));

    await prisma.cart.deleteMany({
      where: { orderedById: Number(req.user.id) },
    });
    res.json({ ok: true, order });

    // ตรวจสอบ
    // res.send('hello saveOrder')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// --------------------------------------------------------------------------------------------------
// 
exports.getOrder = async (req, res) => {
  try {
    //code
    const orders = await prisma.order.findMany({
      where: { orderedById: Number(req.user.id) },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    if (orders.length === 0) {
        return res.status(400).json({ ok: false, message: "No orders" });
      }
      
      console.log(orders)
      res.json({ ok: true, orders });
      // ตรวจสอบ...
      // res.send('hello getOrder')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};