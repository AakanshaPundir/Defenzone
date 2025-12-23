router.get("/product/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    const reviews = await Review.find({ productId: product._id }).sort({ createdAt: -1 });

    res.render("pages/product", {
        product,
        reviews,
        reviewSuccess: req.query.reviewSuccess
    });
});
