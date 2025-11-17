
const mongoose = require('mongoose');
require('dotenv').config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const helmet = require("helmet");
app.use(helmet());

const app = express();

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Initialize cart in session
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
});
app.post("/add-to-cart", (req, res) => {
  const { productId } = req.body;
  
  // Add product to cart session
  req.session.cart.push(productId);

  res.json({ cartCount: req.session.cart.length }); // Send updated count
});


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log(' Connected to MongoDB Atlas'))
.catch(err => console.error(' MongoDB connection error:', err));


// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}



// Home 
app.get("/", requireAuth, (req, res) => {
    res.render("pages/index", { 
        title: "Home", 
        showLoginSidebar: false, 
        showRegisterSidebar: false,
        error: null 
    });
});

// Login (GET)
app.get("/login", (req, res) => {
    
    if (req.session.userId) return res.redirect("/");

    res.render("pages/index", { 
        title: "Login", 
        showLoginSidebar: true, 
        showRegisterSidebar: false,
        error: null 
    });
});

// Register (GET)
app.get("/register", (req, res) => {
    
    if (req.session.userId) return res.redirect("/");

    res.render("pages/index", { 
        title: "Register", 
        showLoginSidebar: false, 
        showRegisterSidebar: true,
        error: null 
    });
});

// Register (POST)
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("pages/index", { 
                title: "Register", 
                showRegisterSidebar: true,
                showLoginSidebar: false,
                error: "Email already exists" 
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.render("pages/index", { 
            title: "Register", 
            showRegisterSidebar: true,
            showLoginSidebar: false,
            error: "Something went wrong" 
        });
    }
});

// Login (POST)
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("pages/index", { 
                title: "Login", 
                showLoginSidebar: true,
                showRegisterSidebar: false,
                error: "Invalid email or password" 
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("pages/index", { 
                title: "Login", 
                showLoginSidebar: true,
                showRegisterSidebar: false,
                error: "Invalid email or password" 
            });
        }
        req.session.userId = user._id;
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("pages/index", { 
            title: "Login", 
            showLoginSidebar: true,
            showRegisterSidebar: false,
            error: "Something went wrong" 
        });
    }
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// About (Public)
app.get("/about", (req, res) => {
    res.render("about", { title: "About Us" });
});

// Size Guide
app.get("/size-guide", (req, res) => {
    res.render("pages/size-guide", { title: "Size Guide" });
});

const Message = require("./models/Message");

// Contact Page (GET)
app.get("/contact", (req, res) => {
  res.render("pages/contact", { 
    title: "Contact Us", 
    success: null, 
    error: null 
  });
});

// Contact Form (POST)
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.render("pages/contact", { 
      title: "Contact Us", 
      success: "✅ Message sent successfully! We’ll get back to you soon.", 
      error: null 
    });
  } catch (err) {
    console.error("Error saving message:", err);
    res.render("pages/contact", { 
      title: "Contact Us", 
      success: null, 
      error: "❌ Something went wrong. Please try again later." 
    });
  }
});



app.get('/products', (req, res) => {
    const products = [
        {
            name: "Tactical Combat Tee",
            description: "Oversized, Defence, Streetwear & Tactical Gear",
            price: 899,
            image: "/images/combat-tee.jpg"
        },
        {
            name: "Operator Apparel",
            description: "Defence, Warm, Comfortable, Premium Fabric",
            price: 1499,
            image: "/images/operator-tshirt.jpg"
        },
        {
            name: "Marcos Force T-Shirt",
            description: "Regular, Marcos Commando Force,t-shirt",
            price: 1299,
            image: "/images/marcos-force-tshirt.jpg"
        },
        {
            name: "Kargil Vijay Diwas T-Shirt",
            description: "Defence, Adjustable, Street Style",
            price: 899,
            image: "/images/kargil-vijay-diwas-tshirt.jpeg"
        },
        {
            name: "Armour T-Shirt",
            description: "Defence, Adjustable, Street Style",
            price: 1499,
            image: "/images/Armour-tshirt.jpeg"
        }
    ];
    res.render('products', { title: 'Our Products', products });
});


// One shared data source for T-Shirts
const tshirtsData = [
    {
        name: "ARMY CAMO Polo T-Shirt",
        image: "/images/t1.jpeg",
        price: "₹799",
        colors: ["Green", "Black"],
        design: "Camo Print",
        style: "Casual Fit",
        vibe: "Army",
        perfectFor: "Outdoor Activities"
    },
    {
        name: "Special Forces T-Shirt",
        image: "/images/t2.jpeg",
        price: "₹899",
        colors: ["Desert Brown", "Khaki"],
        design: "Camo",
        style: "Loose Fit",
        vibe: "Military",
        perfectFor: "Treks & Camps"
    },
    {
        name: "Armour T-Shirt",
        image: "/images/armour2.jpg",
        price: "₹899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Army T-Shirt",
        image: "/images/army-tshirt.jpeg",
        price: "₹1199",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },  

     {
        name: "Kevlar T-Shirt",
        image: "/images/Armour-tshirt.jpeg",
        price: "₹1299",
        colors: ["Black/ White"],
        design: "Minimal Typography",
        style: "Loose Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Marcos T-Shirt",
        image: "/images/marcos-force-tshirt.jpg",
        price: "₹899",
        colors: ["Brown/Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Ballistic T-Shirt",
        image: "/images/n1.jpeg",
        price: "₹999",
        colors: ["Black/Khaki"],
        design: "Minimal Typography",
        style: "Loose Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Tactical T-Shirt",
        image: "/images/t3.jpeg",
        price: "₹1199",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Hybrid Armour T-Shirt",
        image: "/images/n2.jpeg",
        price: "₹3899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Loose Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Cooling Armour T-Shirt",
        image: "/images/n3.jpeg",
        price: "₹1899",
        colors: ["Black/White"],
        design: "Minimal Typography",
        style: "Loose Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    }
];

// T-Shirt pages (both routes render with the same data)
app.get('/shop/tshirt', (req, res) => {
    res.render('tshirts', { title: "T-Shirts", tshirts: tshirtsData });
});

app.get('/tshirts', (req, res) => {
    res.render('tshirts', { title: "T-Shirts", tshirts: tshirtsData });
});
/* ---------- ONLY CHANGE ENDS HERE ---------- */
const hoodieData = [
    {
        name: "ARMY CAMO Polo Hoodie",
        image: "/images/h1.jpeg",
        price: "₹799",
        colors: ["Green", "Black"],
        design: "Camo Print",
        style: "Casual Fit",
        vibe: "Army",
        perfectFor: "Outdoor Activities"
    },
    {
        name: "Spl Forces Hoodie",
        image: "/images/h2.jpeg",
        price: "₹899",
        colors: ["Desert Brown", "Khaki"],
        design: "Camo",
        style: "Loose Fit",
        vibe: "Military",
        perfectFor: "Treks & Camps"
    },
    {
        name: "Armour Hoodie",
        image: "/images/h3.jpeg",
        price: "₹999",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Casual Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Army Hoodie",
        image: "/images/h4.jpeg",
        price: "₹1899",
        colors: ["Black/Black"],
        design: "Minimal Typography",
        style: "Loose Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },  

     {
        name: "Hybrid Armour Hoodie",
        image: "/images/h5.jpeg",
        price: "₹1299",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Casual Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Marcos Hoodie",
        image: "/images/h6.jpeg",
        price: "₹2999",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Casual Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Cooling Armour Hoodie",
        image: "/images/h7.jpeg",
        price: "₹3899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Army Agent Hoodie",
        image: "/images/h8.jpeg",
        price: "₹899",
        colors: ["Black/khaki"],
        design: "Minimal Typography",
        style: "Loose Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Armour Hoodie",
        image: "/images/h9.jpeg",
        price: "₹1899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Casual Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    }
];
app.get("/shop/hoodie", (req, res) => {
    res.render("hoodies", { title: "Hoodie Collection", hoodies: hoodieData  });
});

app.get('/hoodies', (req, res) => {
    res.render('hoodies', { title: "Hoodie Collection", hoodies: hoodieData });
});

const tacticapData = [
    {
        name: "ARMY CAMO Hat",
        image: "/images/c1.jpeg",
        price: "₹799",
        colors: ["Green", "Black"],
        design: "Camo Print",
        style: "Casual Fit",
        vibe: "Army",
        perfectFor: "Outdoor Activities"
    },
    {
        name: "Special Forces Hat",
        image: "/images/c2.jpeg",
        price: "₹899",
        colors: ["Desert Brown", "Khaki"],
        design: "Camo",
        style: "Loose Fit",
        vibe: "Military",
        perfectFor: "Treks & Camps"
    },
    {
        name: "Armour Cap",
        image: "/images/c3.jpeg",
        price: "₹1899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Loose FIT",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Army Cap",
        image: "/images/c4.jpeg",
        price: "₹899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },  

     {
        name: "Hybrid Cap",
        image: "/images/c5.jpeg",
        price: "₹3899",
        colors: ["Black/Purple"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Marcos Cap",
        image: "/images/c6.jpeg",
        price: "₹899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Casual Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Armour Cap",
        image: "/images/n1.jpeg",
        price: "₹999",
        colors: ["Black/Brown"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Army Agent Cap",
        image: "/images/t3.jpeg",
        price: "₹2899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Cooling Armour Cap",
        image: "/images/n2.jpeg",
        price: "₹899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Marcus Cap",
        image: "/images/n3.jpeg",
        price: "₹2899",
        colors: ["Black/Green"],
        design: "Minimal Typography",
        style: "Casual FIT",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    }
];

app.get("/shop/tacticap", (req, res) => {
    res.render("tacticaps", { title: "TactiCap Collection", tacticaps: tacticapData });
});

app.get('/tacticaps', (req, res) => {
    res.render('tacticaps', { title: "TactiCap Collection", tacticaps: tacticapData });
});

const cargoData = [
    {
        name: "ARMY CAMO Polo Cargo",
        image: "/images/a1.jpeg",
        price: "₹799",
        colors: ["Green", "Black"],
        design: "Camo Print",
        style: "Casual Fit",
        vibe: "Army",
        perfectFor: "Outdoor Activities"
    },
    {
        name: "Special Forces Cargo",
        image: "/images/a2.jpeg",
        price: "₹899",
        colors: ["Desert Brown", "Khaki"],
        design: "Camo",
        style: "Loose Fit",
        vibe: "Military",
        perfectFor: "Treks & Camps"
    },
    {
        name: "Armour Cargo",
        image: "/images/a3.jpeg",
        price: "₹1899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Loose fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Army Cargo",
        image: "/images/a4.jpeg",
        price: "₹899",
        colors: ["Black/Green"],
        design: "Minimal Typography",
        style: "Oversized",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },  

     {
        name: "Cooling Armour Cargo",
        image: "/images/a5.jpeg",
        price: "₹1899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Marcos Cargo",
        image: "/images/a6.jpeg",
        price: "₹899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Casual Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Hybrid Armour Cargo",
        image: "/images/a7.jpeg",
        price: "₹899",
        colors: ["Black/Brown"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Army Agent Cargo",
        image: "/images/a8.jpeg",
        price: "₹1899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Cooling Armour Cargo",
        image: "/images/a9.jpeg",
        price: "₹2899",
        colors: ["Black/Green"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    },

     {
        name: "Armour Cargo",
        image: "/images/a10.jpeg",
        price: "₹899",
        colors: ["Black"],
        design: "Minimal Typography",
        style: "Fit",
        vibe: "Patriotic",
        perfectFor: "Everyday wear"
    }
];

app.get("/shop/cargo", (req, res) => {
    res.render("cargos", { title: "Cargo Collection", cargos: cargoData });
});

app.get('/cargos', (req, res) => {
    res.render('cargos', { title: "Cargo Collection", cargos: cargoData });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
