const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const { orderValidation } = require('../validation');
const { date } = require('@hapi/joi');

exports.getProducts = async (req, res, next) => {
  try {
    const prod = await Product.find()//find vraca proizvod a ne kursor
    res.status(200)
      .json({ message: 'Prikupljeni proizvodi', Data: prod })
  }
  catch (err) {
    res.json({ success: false });
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.productId)
    res.json({ message: 'pribavljen je prizvod', prod: prod })
  }
  catch (err) {
    res.json({ success: false });
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
    res.status(200)
      .json({ message: 'Korpa korisnika', Data: user.cart, Success: true })
  }
  catch (err) {
    res.json({ Success: false });
    console.log(err);
  }
  // req.user
  //   .populate('cart.items.productId ')
  //   .execPopulate()
  //   .then(user => {
  //     const products = user.cart.items;
  //         res.render('shop/cart', {
  //           path: '/cart',
  //           pageTitle: 'Vasa korpa',
  //           products: products,
  //           isAuthenticated: req.session.isLoggedIn
  //         });
  //   })
  //   .catch(err => console.log(err));
};

//dodaj u korpu
exports.postCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);
    Product.findById(req.body.productId)
      .then(product => {
        res.status(200)
        return user.addToCart(product);
      })
      .catch(err => console.log(err))
  }
  catch (err) {
    res.json({ success: false });
    console.log(err);
  }
};
//brisanje iz korpe
exports.cartDeleteProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId)
    user.removeFromCart(req.body.productId);
    res.status(200);
  }
  catch (err) {
    res.json({ Success: false });
    console.log(err);
  }
};

// exports.postOrder = async (req, res, next) => {
//   const { error } = orderValidation(req.body);
//   if (error)
//     return res.status(400).send(error.details[0].message);

//   const userId = req.body.userId;
//   try {
//     const user = await User.findById(userId)
//     user
//       .populate('cart.items.productId ')
//       .execPopulate()
//       .then(user => {
//         const products = user.cart.items.map(i => {
//           return { quantity: i.quantity, product: { ...i.productId._doc } };
//           //_doc- samo podaci iz dokumenta(objecta)
//         }); 

//       const products1 = user.cart.items;
//       let total = 0;
//       products1.forEach(p => {
//         total += p.quantity * p.productPrice;
//         console.log(total)
  //     })
  //       const order = new Order({
  //           date: Date.now(),
  //           address: user.address,
  //           number: user.number,
  //           name: user.name,
  //           price: total
  //       });
  //       return order.save();
  //     })
  //     // .then(user => {
  //     //   return user.addOrder(order)
  //     // })
  //     // return user.clearCart();
  //     return user.addOrder(order)
  // }
  // catch (err) {
  //   res.json({ success: false });
  //   console.log(err);
  // }
// };
exports.postOrder = async (req, res, next) => {
  const { error } = orderValidation(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);

  const userId = req.body.userId;
  try {
    const user = await User.findById(userId)
    user
      .populate('cart.items.productId ')
      .execPopulate()
      .then(user => {
        const products = user.cart.items.map(i => {
          return { quantity: i.quantity, product: { ...i.productId._doc } };
          //_doc- samo podaci iz dokumenta(objecta)
        });
        const products1 = user.cart.items;
        let total = 0;
        products1.forEach(p => {
          total += p.quantity * p.productPrice;
          console.log(total)
        })
        const order = new Order({
          date: Date.now(),
          address: user.address,
          price: total,
          number: user.number,
          status: "neobradjen",
          name: user.name,
          userId: user._id,
          products: products
        });
        console.log("radi");
        return order.save();
      })
      .then(order => {
        return user.addOrder(order);
      })
      .catch(err => console.log(err));
  }
  catch (err) {
    res.json({ success: false });
    console.log(err);
  }
};

// exports.sum = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.userId)
//     const products = user.cart.items;
//     let total = 0;

//     products.forEach(p => {
//       total += p.quantity * p.productPrice;
//       console.log(total)
//     });
//     res.json({ message: 'pribavljena suma', total: total })
//   }
//   catch (err) {
//     res.json({ success: false });
//     console.log(err);
//   }
// };

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()//find vraca proizvod a ne kursor
    res.status(200)
      .json({ message: 'Prikupljene narudzbine', orders: orders })
  }
  catch (err) {
    res.json({ success: false });
    console.log(err);
  }
};
// exports.getOrdersItems= async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.userId)
//     console.log(user.listoforders.orders.orderId)
//     const items = await Order.find({"_id": user.listoforders.orders.orderId})
//     res.status(200)
//       .json({ message: 'Prikupljene narudzbine', Data: items })
//   }
//   catch (err) {
//     res.json({ success: false });
//     console.log(err);
//   }
// };
exports.getUnOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()//find vraca proizvod a ne kursor
    const unresOrders = await Order.find({ "status": "neobradjen" })
    res.status(200)
      .json({ Data: unresOrders })
  }
  catch (err) {
    res.json({ success: false });
    console.log(err);
  }
};

exports.getOrdersByUserId = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
    // const ord = user.listoforders;
    // ord.forEach(o => {
    //   console.log(o.orderId)
    // });
    res.status(200)

      .json({ Data: user.listoforders, Success: true })
  }
  catch (err) {
    res.json({ Success: false });
    console.log(err);
  }
}

