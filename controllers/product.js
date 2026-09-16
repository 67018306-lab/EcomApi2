// const prisma = require("../config/prisma");
// import cloudinary = require=( 'cloudinary').v2
const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;

// Configuration cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// ไปพ่วงเช้ากับของ route และใน postman
// create มาจากของ product
exports.create = async (req, res) => {
  try {
    // code...
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    // ตรวจสอบในแสดงผลออกมาจาก Postman และส่งค่ามาทาง terminal
    // console.log(title, description, price, quantity, images)

    const product = await prisma.product.create({
      data: {
        // ซ้ายFrell ในฐานข้อมูล : ขาว สิ่งที่ส่งมาจาก frontend
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        // 1 product มีหลายรูปได้
        images: {
          create: (images || []).map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.send(product);
    // ตรวจสอบของใน Postman
    // res.send('Hello create Product in controller')
    // ตรวจสอบ
    // res.send('Hello category create')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
// List มาจาก products มี s
exports.list = async (req, res) => {
  try {
    // code...
    const { count } = req.params;
    // ส่งสินค้าทั้งหมด
    const products = await prisma.product.findMany({
      take: parseInt(count),
      // เรียงตามการเพิ่ม
      orderBy: { createdAt: "desc" },
      // การสร้างสวนเสริม include การรวมถึง
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
    // ตรวจสอบ
    // console.log(typeof count) จะแสดงผลออก termi เป็นประเภท string
    // res.send('Hello Read list Product in controller')
    // res.send('Hello category create')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
// read เป็นการอ่านข้อมูลมูลชนิดเดียว
exports.read = async (req, res) => {
  try {
    // code...
    const { id } = req.params;
    // ส่งสินค้าทั้งหมด
    const products = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      // การสร้างสวนเสริม include การรวมถึง
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
    // ตรวจสอบ
    // console.log(typeof count) จะแสดงผลออก termi เป็นประเภท string
    // res.send('Hello Read list Product in controller')
    // res.send('Hello category create')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
// เดิม
exports.update = async (req, res) => {
  try {
    // code...
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    // ตรวจสอบในแสดงผลออกมาจาก Postman และส่งค่ามาทาง terminal
    // console.log(title, description, price, quantity, images)

    // เป็นการเคลียรูปเก่า แทน ด้วยรูปใหม่
    await prisma.image.deleteMany({
      where: {
        productId: Number(req.params.id),
      },
    });

    //
    const product = await prisma.product.update({
      // หสตำแหน่ง
      where: {
        id: Number(req.params.id),
      },
      data: {
        // ซ้ายFrell ในฐานข้อมูล : ขาว สิ่งที่ส่งมาจาก frontend
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        // 1 product มีหลายรูปได้
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.send(product);
    // ตรวจสอบ
    // res.send('Hello category create')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
// จาก Delete ใน postman
exports.remove = async (req, res) => {
  try {
    // code...
    const { id } = req.params;
    // หนังชีวิต
    // Step 1 ค้นหาสินค้า include images
    const product = await prisma.product.findFirst({
      where: { id: Number(id) },
      include: { images: true },
    });
    if (!product) {
      return res.status(400).json({ message: "Product not found!!" });
    }
    console.log(product);

    // // Step 2 Promise ลบรูปภาพใน cloud ลบแบบ รอฉันด้วย
    const deletedImage = product.images.map(
      (image) =>
        new Promise((resolve, reject) => {
          // ลบจาก cloud
          cloudinary.uploader.destroy(image.public_id, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
    );
    await Promise.all(deletedImage);

    // Step 3 ลบสินค้า
    await prisma.product.delete({
      where: {
        id: Number(id),
      },
      // include: { images: true }
    });

    res.send("Delete Success");
    // ตรวจสอบ
    // res.send("Delete Success");
    // res.send('Hello category create')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
// ของเดิม
exports.listby = async (req, res) => {
  try {
    // code...
    // sort, order, limit ตามราคาสินค้า/อยากทราบอะไร, จากน้อยไปมาก, ลิมิต
    const { sort, order, limit } = req.body;
    console.log(sort, order, limit);
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { [sort]: order },
      include: {
        category: true,
        images:true
      },
    });
    res.send(products);
    // ตรวจสอบ
    // res.send('Hello listby Product in controller')
    // res.send('Hello category create')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
// ██████╗ ███████╗ █████╗ ██████╗ ██╗      ██╗    ██╗ █████╗ ██╗███████╗██╗   ██╗
// ██╔══██╗██╔════╝██╔══██╗██╔══██╗██║      ██║    ██║██╔══██╗██║██╔════╝██║   ██║
// ██████╔╝█████╗  ███████║██████╔╝██║      ██║ █╗ ██║███████║██║█████╗  ██║   ██║
// ██╔═══╝ ██╔══╝  ██╔══██║██╔══██╗██║      ██║███╗██║██╔══██║██║██╔══╝  ██║   ██║
// ██║     ███████╗██║  ██║██║  ██║███████╗ ╚███╔███╔╝██║  ██║██║██║     ╚██████╔╝
// --------------------------------------------------------------------------------------

// Query
const handleQuery = async (req, res, query) => {
  try {
    //code
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Search Error" });
  }
};

// Price เป็น array
const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          // gte มากกว่าตัวน้อย, lte น้อยกว่าค่ามากสุด / ค้นหาสินค้าที่อยู่ในช่วงราคา
          gte: priceRange[0],
          lte: priceRange[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error " });
  }
};

// Category สามารถเลือกได้หลายอย่าง
const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error " });
  }
};

// --------------------------------------------------------------------------------------

// ของเดิม
exports.searchFilters = async (req, res) => {
  try {
    // code...
    const { query, category, price } = req.body;
    // handleQuery จากฟังก์
    if (query) {
      console.log("query-->", query);
      await handleQuery(req, res, query);
    }
    // handleCategory
    if (category) {
      console.log("category-->", category);
      await handleCategory(req, res, category);
    }
    // handlePrice
    if (price) {
      console.log("price-->", price);
      await handlePrice(req, res, price);
    }

    // ตรวจสอบ
    // res.send('Hello searchFilters Product in controller')
    // res.send('Hello category create')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
//

// ███╗   ██╗██╗██╗  ██╗██╗██╗     ██╗   ██╗██╗  ██╗  ██╗    ██╗ █████╗ ██╗███████╗██╗   ██╗
// ████╗  ██║██║██║  ██║██║██║     ██║   ██║╚██╗██╔╝  ██║    ██║██╔══██╗██║██╔════╝██║   ██║
// ██╔██╗ ██║██║███████║██║██║     ██║   ██║ ╚███╔╝   ██║ █╗ ██║███████║██║█████╗  ██║   ██║
// ██║╚██╗██║██║██╔══██║██║██║     ██║   ██║ ██╔██╗   ██║███╗██║██╔══██║██║██╔══╝  ██║   ██║
// ██║ ╚████║██║██║  ██║██║███████╗╚██████╔╝██╔╝ ██╗  ╚███╔███╔╝██║  ██║██║██║     ╚██████╔╝
// ----------------------------------------------------------------------------------------------

// การสร้าง Image ลง cloud
exports.createImages = async (req, res) => {
  try {
    //code
    console.log(req.body);
    const result = await cloudinary.uploader.upload(req.body.image, {
      // public_id: `Roitai-${Date.now()}`,
      public_id: `PearlNihilux-${Date.now()}`,
      resource_type: "auto",
      folder: "Ecom2024",
    });
    res.send(result);
    // res.send("Hello Create Image");
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ลบภาพ
exports.removeImage = async (req, res) => {
  try {
    //code
    // ตรวจสอบการส่งมาของตัวแปร
    // console.log(req.body.public_id)

    const { public_id } = req.body;
    console.log(public_id);
    cloudinary.uploader.destroy(public_id, (result) => {
      res.send("Remove Image Success!!!");
    });

    // res.send(result)
    // res.send("Hello removeImage");
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// const prisma = require("../config/prisma")
// const cloudinary = require('cloudinary').v2;

// // Configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// exports.create = async (req, res) => {
//     try {
//         // code
//         const { title, description, price, quantity, categoryId, images } = req.body
//         // console.log(title, description, price, quantity, images)
//         const product = await prisma.product.create({
//             data: {
//                 title: title,
//                 description: description,
//                 price: parseFloat(price),
//                 quantity: parseInt(quantity),
//                 categoryId: parseInt(categoryId),
//                 images: {
//                     create: images.map((item) => ({
//                         asset_id: item.asset_id,
//                         public_id: item.public_id,
//                         url: item.url,
//                         secure_url: item.secure_url
//                     }))
//                 }
//             }
//         })
//         res.send(product)
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({ message: "Server error" })
//     }
// }
// exports.list = async (req, res) => {
//     try {
//         // code
//         const { count } = req.params
//         const products = await prisma.product.findMany({
//             take: parseInt(count),
//             orderBy: { createdAt: "desc" },
//             include: {
//                 category: true,
//                 images: true
//             }
//         })
//         res.send(products)
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({ message: "Server error" })
//     }
// }
// exports.read = async (req, res) => {
//     try {
//         // code
//         const { id } = req.params
//         const products = await prisma.product.findFirst({
//             where: {
//                 id: Number(id)
//             },
//             include: {
//                 category: true,
//                 images: true
//             }
//         })
//         res.send(products)
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({ message: "Server error" })
//     }
// }
// exports.update = async (req, res) => {
//     try {
//         // code
//         const { title, description, price, quantity, categoryId, images } = req.body
//         // console.log(title, description, price, quantity, images)

//         await prisma.image.deleteMany({
//             where: {
//                 productId: Number(req.params.id)
//             }
//         })

//         const product = await prisma.product.update({
//             where: {
//                 id: Number(req.params.id)
//             },
//             data: {
//                 title: title,
//                 description: description,
//                 price: parseFloat(price),
//                 quantity: parseInt(quantity),
//                 categoryId: parseInt(categoryId),
//                 images: {
//                     create: images.map((item) => ({
//                         asset_id: item.asset_id,
//                         public_id: item.public_id,
//                         url: item.url,
//                         secure_url: item.secure_url
//                     }))
//                 }
//             }
//         })
//         res.send(product)
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({ message: "Server error" })
//     }
// }
// exports.remove = async (req, res) => {
//     try {
//         // code
//         const { id } = req.params
//         // หนังชีวิต
//         // Step 1 ค้นหาสินค้า include images
//         const product = await prisma.product.findFirst({
//             where: { id: Number(id) },
//             include: { images: true }
//         })
//         if (!product) {
//             return res.status(400).json({ message: 'Product not found!!' })
//         }
//         // console.log(product)
//         // Step 2 Promise ลบรูปภาพใน cloud ลบแบบ รอฉันด้วย
//         const deletedImage = product.images
//         .map((image)=>
//         new Promise((resolve,reject)=>{
//             // ลบจาก cloud
//             cloudinary.uploader.destroy(image.public_id,(error,result)=>{
//                 if(error) reject(error)
//                 else resolve(result)
//             })
//         })
//         )
//         await Promise.all(deletedImage)
//         // Step 3 ลบสินค้า
//         await prisma.product.delete({
//             where: {
//                 id: Number(id)
//             }
//         })

//         res.send('Deleted Success')
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({ message: "Server error" })
//     }
// }
// exports.listby = async (req, res) => {
//     try {
//         // code
//         const { sort, order, limit } = req.body
//         console.log(sort, order, limit)
//         const products = await prisma.product.findMany({
//             take: limit,
//             orderBy: { [sort]: order },
//             include: {
//                 category: true,
//                 images:true
//              }
//         })
//         res.send(products)
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({ message: "Server error" })
//     }
// }

// const handleQuery = async (req, res, query) => {
//     try {
//         //code
//         const products = await prisma.product.findMany({
//             where: {
//                 title: {
//                     contains: query,
//                 }
//             },
//             include: {
//                 category: true,
//                 images: true
//             }

//         })
//         res.send(products)
//     } catch (err) {
//         //err
//         console.log(err)
//         res.status(500).json({ message: "Search Error" })
//     }
// }
// const handlePrice = async (req, res, priceRange) => {
//     try {
//         const products = await prisma.product.findMany({
//             where: {
//                 price: {
//                     gte: priceRange[0],
//                     lte: priceRange[1]
//                 }
//             },
//             include: {
//                 category: true,
//                 images: true
//             }
//         })
//         res.send(products)
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({ message: 'Server Error ' })
//     }
// }
// const handleCategory = async (req, res, categoryId) => {
//     try {
//         const products = await prisma.product.findMany({
//             where: {
//                 categoryId: {
//                     in: categoryId.map((id) => Number(id))
//                 }
//             },
//             include: {
//                 category: true,
//                 images: true
//             }
//         })
//         res.send(products)
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({ message: 'Server Error ' })
//     }
// }

// exports.searchFilters = async (req, res) => {
//     try {
//         // code
//         const { query, category, price } = req.body

//         if (query) {
//             console.log('query-->', query)
//             await handleQuery(req, res, query)
//         }
//         if (category) {
//             console.log('category-->', category)
//             await handleCategory(req, res, category)
//         }
//         if (price) {
//             console.log('price-->', price)
//             await handlePrice(req, res, price)
//         }

//         // res.send('Hello searchFilters Product')
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({ message: "Server error" })
//     }
// }

// exports.createImages = async (req, res) => {
//     try {
//         //code
//         // console.log(req.body)
//         const result = await cloudinary.uploader.upload(req.body.image, {
//             public_id: `Roitai-${Date.now()}`,
//             resource_type: 'auto',
//             folder: 'Ecom2024'
//         })
//         res.send(result)
//     } catch (err) {
//         //err
//         console.log(err)
//         res.status(500).json({ message: "Server Error" })
//     }
// }
// exports.removeImage = async (req, res) => {
//     try {
//         //code
//         const { public_id } = req.body
//         // console.log(public_id)
//         cloudinary.uploader.destroy(public_id, (result) => {
//             res.send('Remove Image Success!!!')
//         })

//     } catch (err) {
//         //err
//         console.log(err)
//         res.status(500).json({ message: "Server Error" })
//     }
// }
