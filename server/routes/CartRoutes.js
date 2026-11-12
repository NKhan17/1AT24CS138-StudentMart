const express = require("express");
const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

// Authentication middleware
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

// GET /api/cart - Get current user's cart
router.get("/", authenticate, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate({
            path: "items.product",
            populate: {
                path: "seller",
                select: "name usn email"
            }
        });

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        // Filter out any items whose product might have been deleted
        const validItems = cart.items.filter((item) => item.product != null);
        if (validItems.length !== cart.items.length) {
            cart.items = validItems;
            await cart.save();
        }

        res.json({ cart });
    } catch (error) {
        console.error("Fetch cart error:", error);
        res.status(500).json({ message: "Unable to fetch cart" });
    }
});

// POST /api/cart/add - Add product to cart
router.post("/add", authenticate, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
            return res.status(400).json({ message: "Valid Product ID is required." });
        }

        const addQty = Number(quantity);
        if (!Number.isInteger(addQty) || addQty <= 0) {
            return res.status(400).json({ message: "Quantity must be a positive integer." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Stock Availability Check
        if (product.stock <= 0) {
            return res.status(400).json({
                message: "This product is currently Out of Stock and cannot be added to cart."
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            const newTotalQty = cart.items[existingItemIndex].quantity + addQty;
            if (newTotalQty > product.stock) {
                return res.status(400).json({
                    message: `Cannot add more. Only ${product.stock} item(s) available in stock.`
                });
            }
            cart.items[existingItemIndex].quantity = newTotalQty;
        } else {
            if (addQty > product.stock) {
                return res.status(400).json({
                    message: `Cannot add ${addQty} item(s). Only ${product.stock} available in stock.`
                });
            }
            cart.items.push({
                product: productId,
                quantity: addQty
            });
        }

        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate({
            path: "items.product",
            populate: {
                path: "seller",
                select: "name usn email"
            }
        });

        res.json({
            message: "Product added to cart successfully.",
            cart: populatedCart
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ message: "Unable to add product to cart." });
    }
});

// PUT /api/cart/update - Update quantity of an item
router.put("/update", authenticate, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const newQty = Number(quantity);
        if (!productId || !Number.isInteger(newQty) || newQty < 0) {
            return res.status(400).json({ message: "Invalid product ID or quantity." });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (existingItemIndex === -1) {
            return res.status(404).json({ message: "Item not in cart." });
        }

        if (newQty === 0) {
            cart.items.splice(existingItemIndex, 1);
        } else {
            const product = await Product.findById(productId);
            if (!product || product.stock <= 0) {
                return res.status(400).json({ message: "Product is out of stock." });
            }
            if (newQty > product.stock) {
                return res.status(400).json({
                    message: `Only ${product.stock} item(s) available in stock.`
                });
            }
            cart.items[existingItemIndex].quantity = newQty;
        }

        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate({
            path: "items.product",
            populate: {
                path: "seller",
                select: "name usn email"
            }
        });

        res.json({
            message: "Cart updated.",
            cart: populatedCart
        });
    } catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({ message: "Unable to update cart." });
    }
});

// DELETE /api/cart/remove/:productId - Remove an item from cart
router.delete("/remove/:productId", authenticate, async (req, res) => {
    try {
        const { productId } = req.params;

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate({
            path: "items.product",
            populate: {
                path: "seller",
                select: "name usn email"
            }
        });

        res.json({
            message: "Item removed from cart.",
            cart: populatedCart
        });
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({ message: "Unable to remove item from cart." });
    }
});

// DELETE /api/cart/clear - Clear the cart
router.delete("/clear", authenticate, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.json({ message: "Cart cleared.", cart: { items: [] } });
    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({ message: "Unable to clear cart." });
    }
});

module.exports = router;

