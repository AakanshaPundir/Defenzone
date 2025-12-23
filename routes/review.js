const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Review = require("../models/Review");

// POST — Receive review
router.post("/", async (req, res) => {
    const { name, email, rating, message } = req.body;

    try {
        const review = new Review({ name, email, rating, message });
        await review.save();

        // Send email to the client
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Thank you for your review!",
            text: `Hi ${name}, thanks for your feedback!\n\nYour review:\n${message}`
        });

        res.redirect("/reviews");
    } catch (err) {
        console.log(err);
        res.send("Error submitting review");
    }
});

// DELETE — Delete a review
router.post("/delete/:id", async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.redirect("/reviews");
    } catch (err) {
        console.log(err);
        res.send("Error deleting review");
    }
});


// GET — Load reviews page
router.get("/", async (req, res) => {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.render("pages/reviews", { reviews });
});

module.exports = router;
