const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("connect-flash");

const User = require("./models/User");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

// Connect to DB
mongoose.connect("mongodb://127.0.0.1:27017/todoDB");

// Middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.use(session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));