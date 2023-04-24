const mongoose = require('mongoose')

let ItemSchema = new mongoose.Schema(
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
      size: {
        type: String
      },
      color: {
        type: String
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity can not be less then 1."],
      },
      price: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );
module.exports = mongoose.model("item", ItemSchema);

const CartSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
  
      items: [ItemSchema],
  
      subTotal: {
        default: 0,
        type: Number,
      },
    },
    {
      timestamps: true,
    }
);

module.exports = mongoose.model("cart", CartSchema);