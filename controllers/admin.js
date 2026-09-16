const prisma = require("../config/prisma");
//
exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;
    // เข็คใน boby
    // console.log(orderId, orderStatus)

    const orderUpdate = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: orderStatus },
    });

    res.json(orderUpdate);
    // res.send('change')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
//
exports.getOrderAdmin = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
        orderedBy: {
          select: {
            id: true,
            email: true,
            address: true,
          },
        },
      },
    });
    res.json(orders);
    // res.send('getorder')
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
