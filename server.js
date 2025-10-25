require('dotenv').config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");

const User = require("./models/User");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

// --- Connect to MongoDB Atlas ---
mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected ✅"))
    .catch(err => console.log("MongoDB connection error:", err));

// --- Middlewares ---
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.use(session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success");
    res.locals.error_msg = req.flash("error");
    next();
});

// Passport config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make user available in all views
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Routes
app.use("/", todoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));