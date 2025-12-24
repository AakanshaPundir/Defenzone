const express = require("express");
const router = express.Router();

router.post("/add", (req, res) => {
    const { id, name, price, image } = req.body;

    if (!req.session.cart) req.session.cart = [];

    // Check if item already in cart
    const existing = req.session.cart.find(item => item.id === id);

    if (existing) {
        existing.qty += 1;
    } else {
        req.session.cart.push({
            id,
            name,
            price: Number(price),
            image,
            qty: 1
        });
    }

    res.json({
        success: true,
        cartCount: req.session.cart.reduce((sum, item) => sum + item.qty, 0)
    });
});

router.get("/", (req, res) => {

    
    if (!req.session.cart) {
        req.session.cart = [];
    }

    res.render("pages/cart", {
        cart: req.session.cart
    });
});

/* REMOVE ITEM */
router.get("/remove/:id", (req, res) => {
    const productId = req.params.id;

    req.session.cart = req.session.cart.filter(
        item => item.id !== productId
    );

    res.redirect("/cart");
});


module.exports = router;