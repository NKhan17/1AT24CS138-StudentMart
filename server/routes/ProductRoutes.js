

//server/routes/ProductRoutes.js for 3rd program

const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const User = require("../models/User");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET all products, with optional search, category and price sorting
router.get("/", async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        const filter = {};

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        if (category && category !== "All") {
            filter.category = category;
        }

        let query = Product.find(filter).populate("seller", "name usn email");

        if (sort === "lowToHigh") {
            query = query.sort({ price: 1 });
        } else if (sort === "highToLow") {
            query = query.sort({ price: -1 });
        }

        const products = await query.exec();

        res.json(products);
    } catch (error) {
        console.error("Fetch products error:", error);
        res.status(500).json({
            message: "Unable to fetch products"
        });
    }
});

// GET a single product
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id).populate("seller", "name usn email");

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);
    } catch (error) {
        console.error("Fetch product error:", error);
        res.status(500).json({
            message: "Unable to fetch product"
        });
    }
});

// ADD a product (Admin only)
router.post("/", authenticate, requireAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            stock
        } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof description !== "string" || !description.trim() ||
            typeof category !== "string" || !category.trim()
        ) {
            return res.status(400).json({
                message: "Name, description and category are required"
            });
        }

        const parsedPrice = Number(price);
        const parsedStock = stock === undefined || stock === ""
            ? 0
            : Number(stock);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({
                message: "Price must be a non-negative number"
            });
        }

        if (!Number.isInteger(parsedStock) || parsedStock < 0) {
            return res.status(400).json({
                message: "Stock must be a non-negative whole number"
            });
        }

        if (image !== undefined && typeof image !== "string") {
            return res.status(400).json({
                message: "Image must be a URL string"
            });
        }

        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: parsedPrice,
            category: category.trim(),
            image: image?.trim() || "",
            stock: parsedStock,
            seller: req.user._id,
            sellerName: req.user.name || req.user.usn || "Admin",
            sellerEmail: req.user.email || ""
        });

        res.status(201).json({
            message: "Product added successfully",
            product
        });
    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({
            message: "Unable to add product"
        });
    }
});

// UPDATE / EDIT a product (Admin only) - includes stock and availability management
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const {
            name,
            description,
            price,
            category,
            image,
            stock
        } = req.body;

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({ message: "Name cannot be empty" });
            }
            product.name = name.trim();
        }

        if (description !== undefined) {
            if (typeof description !== "string" || !description.trim()) {
                return res.status(400).json({ message: "Description cannot be empty" });
            }
            product.description = description.trim();
        }

        if (category !== undefined) {
            if (typeof category !== "string" || !category.trim()) {
                return res.status(400).json({ message: "Category cannot be empty" });
            }
            product.category = category.trim();
        }

        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({ message: "Price must be a non-negative number" });
            }
            product.price = parsedPrice;
        }

        if (stock !== undefined) {
            const parsedStock = Number(stock);
            if (!Number.isInteger(parsedStock) || parsedStock < 0) {
                return res.status(400).json({ message: "Stock must be a non-negative whole number" });
            }
            product.stock = parsedStock;
        }

        if (image !== undefined) {
            product.image = typeof image === "string" ? image.trim() : "";
        }

        await product.save();

        res.json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            message: "Unable to update product"
        });
    }
});

// DELETE a product (Admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product removed successfully"
        });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            message: "Unable to delete product"
        });
    }
});

module.exports = router;