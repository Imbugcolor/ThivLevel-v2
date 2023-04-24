const Cart = require("../models/cartModel");

exports.cart = async (req) => {
    const carts = await Cart.find({userId: req.user.id}).populate({
        path: "items.productId",
        select: "name price total"
    });
    return carts[0];
};

exports.addItem = async payload => {
    const newItem = await Cart.create(payload);
    return newItem
}