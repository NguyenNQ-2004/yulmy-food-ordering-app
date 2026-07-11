const Cart = require('../models/Cart');
const Food = require('../models/Food');
require('../models/Restaurant');

const populateCart = (query) =>
  query.populate('restaurant').populate('items.food');

const calculateCartTotals = (items) => {
  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.price);

    return {
      food: item.food,
      name: item.name,
      image: item.image || '',
      quantity,
      price,
      subtotal: quantity * price,
    };
  });

  return {
    items: normalizedItems,
    totalItems: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: normalizedItems.reduce((sum, item) => sum + item.subtotal, 0),
  };
};

const getMyCart = async (req, res) => {
  try {
    const cart = await populateCart(Cart.findOne({ user: req.user._id }));

    return res.status(200).json({
      success: true,
      data: {
        cart,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting cart',
    });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;
    const itemQuantity = Number(quantity);

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide foodId',
      });
    }

    if (!Number.isInteger(itemQuantity) || itemQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    const food = await Food.findById(foodId);
    if (!food || !food.isAvailable) {
      return res.status(404).json({
        success: false,
        message: 'Food not found or unavailable',
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart && cart.restaurant.toString() !== food.restaurant.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cart already contains items from another restaurant',
      });
    }

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        restaurant: food.restaurant,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.food.toString() === food._id.toString()
    );

    if (existingItem) {
      existingItem.quantity += itemQuantity;
      existingItem.price = food.price;
      existingItem.name = food.name;
      existingItem.image = food.image || '';
    } else {
      cart.items.push({
        food: food._id,
        name: food.name,
        image: food.image || '',
        quantity: itemQuantity,
        price: food.price,
        subtotal: food.price * itemQuantity,
      });
    }

    const totals = calculateCartTotals(cart.items);
    cart.items = totals.items;
    cart.totalItems = totals.totalItems;
    cart.totalAmount = totals.totalAmount;

    await cart.save();

    const populatedCart = await populateCart(Cart.findById(cart._id));

    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart: populatedCart,
      },
    });
  } catch (error) {
    console.error('Add cart item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding item to cart',
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { quantity } = req.body;
    const itemQuantity = Number(quantity);

    if (!Number.isInteger(itemQuantity) || itemQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be zero or a positive integer',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const item = cart.items.find((cartItem) => cartItem.food.toString() === foodId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    if (itemQuantity === 0) {
      cart.items = cart.items.filter((cartItem) => cartItem.food.toString() !== foodId);
    } else {
      const food = await Food.findById(foodId);
      if (!food || !food.isAvailable) {
        return res.status(404).json({
          success: false,
          message: 'Food not found or unavailable',
        });
      }

      item.quantity = itemQuantity;
      item.price = food.price;
      item.name = food.name;
      item.image = food.image || '';
    }

    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      return res.status(200).json({
        success: true,
        message: 'Item removed and cart is now empty',
        data: {
          cart: null,
        },
      });
    }

    const totals = calculateCartTotals(cart.items);
    cart.items = totals.items;
    cart.totalItems = totals.totalItems;
    cart.totalAmount = totals.totalAmount;

    await cart.save();

    const populatedCart = await populateCart(Cart.findById(cart._id));

    return res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: {
        cart: populatedCart,
      },
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart item',
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { foodId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter((item) => item.food.toString() !== foodId);

    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      return res.status(200).json({
        success: true,
        message: 'Item removed and cart is now empty',
        data: {
          cart: null,
        },
      });
    }

    const totals = calculateCartTotals(cart.items);
    cart.items = totals.items;
    cart.totalItems = totals.totalItems;
    cart.totalAmount = totals.totalAmount;

    await cart.save();

    const populatedCart = await populateCart(Cart.findById(cart._id));

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart: populatedCart,
      },
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing cart item',
    });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });

    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: {
        cart: null,
      },
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while clearing cart',
    });
  }
};

module.exports = {
  getMyCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
