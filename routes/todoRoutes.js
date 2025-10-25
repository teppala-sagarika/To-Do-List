const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");
const User = require("../models/User");
const passport = require("passport");

// Middleware to check login
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

// --- Auth Routes ---
router.get("/register", (req, res) => res.render("register"));
router.post("/register", async(req, res) => {
    try {
        const user = new User({ username: req.body.username });
        await User.register(user, req.body.password);
        passport.authenticate("local")(req, res, () => res.redirect("/"));
    } catch (err) {
        console.error(err);
        res.redirect("/register");
    }
});

// Login page
router.get("/login", (req, res) => {
    res.render("login", { alertMsg: null });
});


router.post("/login", (req, res, next) => {
    passport.authenticate("local", function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            return res.render("login", { alertMsg: "Invalid username or password" });
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect("/");
        });
    })(req, res, next);
});


router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/login");
    });
});

// --- Todo Routes ---
router.get("/", isLoggedIn, async(req, res) => {
    const todos = await Todo.find({ user: req.user._id });
    res.render("index", { todos });
});

router.post("/add", isLoggedIn, async(req, res) => {
    await Todo.create({ task: req.body.task, user: req.user._id });
    res.redirect("/");
});

router.post("/complete/:id", isLoggedIn, async(req, res) => {
    const todo = await Todo.findById(req.params.id);
    if (todo.user.equals(req.user._id)) {
        todo.completed = !todo.completed;
        await todo.save();
    }
    res.redirect("/");
});

router.delete("/delete/:id", isLoggedIn, async(req, res) => {
    const todo = await Todo.findById(req.params.id);
    if (todo.user.equals(req.user._id)) await Todo.findByIdAndDelete(req.params.id);
    res.redirect("/");
});

router.get("/edit/:id", isLoggedIn, async(req, res) => {
    const todo = await Todo.findById(req.params.id);
    if (!todo.user.equals(req.user._id)) return res.redirect("/");
    res.render("edit", { todo });
});

router.post("/edit/:id", isLoggedIn, async(req, res) => {
    const todo = await Todo.findById(req.params.id);
    if (todo.user.equals(req.user._id)) {
        await Todo.findByIdAndUpdate(req.params.id, { task: req.body.task });
    }
    res.redirect("/");
});

module.exports = router;