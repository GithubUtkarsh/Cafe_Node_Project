const express = require('express');
let router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const con = require('../database/mysqlconfig');
const multer = require('multer');
const passport = require('passport');
const { register } = require('module');


router.get('/', async (req, res) => {

    try {
        const [addRecipe] = await con.promise().query('SELECT * FROM view_recipe');
        res.render('index', {
            addRecipe: addRecipe,
        });
        console.log(addRecipe);

    } catch (err) {
        console.log(err);
    }

    // res.render('index',{
    //     addRecipe: addRecipe
    // });
});

router.get('/contact', (req, res) => {
    res.render('contact');
});
router.get('/privacy-policy', (req, res) => {
    res.render('privacy_policy');
});
router.get('/login', (req, res) => {
    res.render('./common/login');
});

//& ************************************************************* SEARCH API *************************************************************
router.get("/search", async (req, res) => {
    try {
        const searchTerm = req.query.q; // value from frontend (e.g. ?q=manali)

        if (!searchTerm) {
            // if empty search, just show an empty results page
            return res.render("search", { results: [], searchTerm: "" });
        }

        const [results] = await con.promise().query(
            "SELECT * FROM view_recipe WHERE MATCH(recipe_name, description) AGAINST (? IN NATURAL LANGUAGE MODE)",
            [searchTerm]
        );


        // render results in EJS page
        res.render("search", { results, searchTerm });
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).send("Internal server error");
    }
});


//& ************************************************************* SHOW LOGIN ***************************************************************
router.get('/dashboard', async (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        try {
            console.log("SESSION USER:", req.session.user);  // debug

            // Prefer email from session.user
            const userEmail = req.session.user.email ||
                (req.session.user.emails ? req.session.user.emails[0].value : null);

            if (!userEmail) {
                return res.redirect('/login');
            }

            const [rows] = await con.promise().query(
                "SELECT email FROM register WHERE email = ?",
                [userEmail]
            );

            res.render("dashboard/index", {
                register: rows[0],
                content: "dashboard-home.ejs"
            });

        } catch (err) {
            console.error(err);
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/dashboard/addRecipe', async (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        try {
            console.log("SESSION USER:", req.session.user);  // debug

            // Prefer email from session.user
            const userEmail = req.session.user.email ||
                (req.session.user.emails ? req.session.user.emails[0].value : null);

            if (!userEmail) {
                return res.redirect('/login');
            }

            const [rows] = await con.promise().query(
                "SELECT email FROM register WHERE email = ?",
                [userEmail]
            );

            res.render("dashboard/index", {
                register: rows[0],
                content: "addRecipe.ejs"
            });

        } catch (err) {
            console.error(err);
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
});


//& ************************************************************* GOOGLE LOGIN API *******************************************************
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        const googleUser = req.user;

        // Check if user already exists
        con.query("SELECT * FROM register WHERE email = ? AND provider = 'google'",
            [googleUser.emails[0].value],
            (err, rows) => {
                if (err) throw err;

                if (rows.length > 0) {
                    // ✅ User already exists → just log them in
                    req.session.user = rows[0];
                    res.redirect("/dashboard");
                } else {
                    // ❌ User not found → insert into DB
                    const newUser = {
                        first_name: googleUser.name.givenName,
                        last_name: googleUser.name.familyName,
                        email: googleUser.emails[0].value,
                        password: null,        // Google handles authentication
                        provider: "google"
                    };

                    con.query("INSERT INTO register SET ?", newUser, (err, result) => {
                        if (err) throw err;
                        console.log("Google user inserted:", result.insertId);
                        req.session.user = { id: result.insertId, ...newUser };
                        res.redirect("/dashboard");
                    });
                }
            });
    }
);

//& ********************************************************************** FACEBOOK LOGIN API ****************************************************************
// Step 1: Redirect to Facebook login
router.get("/auth/facebook", 
    passport.authenticate("facebook", { scope: ["email"] })
);

// Step 2: Facebook callback
router.get("/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/" }),
    (req, res) => {
        const facebookUser = req.user;

        // Get email (may not always be present if user hides email)
        const userEmail = facebookUser.emails ? facebookUser.emails[0].value : null;

        // Check if user exists in DB
        con.query(
            "SELECT * FROM register WHERE email = ? AND provider = 'facebook'",
            [userEmail],
            (err, rows) => {
                if (err) throw err;

                if (rows.length > 0) {
                    // ✅ Existing user → log in
                    req.session.user = rows[0];
                    res.redirect("/dashboard");
                } else {
                    // ❌ New user → insert into DB
                    const newUser = {
                        first_name: facebookUser.name.givenName || "",
                        last_name: facebookUser.name.familyName || "",
                        email: userEmail,
                        password: null,      // Facebook handles auth
                        provider: "facebook"
                    };

                    con.query("INSERT INTO register SET ?", newUser, (err, result) => {
                        if (err) throw err;
                        console.log("Facebook user inserted:", result.insertId);
                        req.session.user = { id: result.insertId, ...newUser };
                        res.redirect("/dashboard");
                    });
                }
            }
        );
    }
);


//& ********************************************************************** Login Api ************************************************************************
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    const sql = "SELECT * FROM register WHERE email = ?";
    con.query(sql, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Server error");
        }
        const user = results[0];
        // ✅ If password stored as hashed (recommended)
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Server error");
            }
            if (!match) {
                console.log("❌ Password doesn't match");
                return res.redirect('/login');
            }
            // Save session
            console.log("✅ Login successful");
            req.session.user = user;
            res.redirect('/dashboard');
        });
    });
});

//& ********************************* LOGOUT API *******************************
router.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie("user_sid");
        res.redirect('/login');
    } else {
        res.redirect('/');
    }
});




router.post('/contact', (req, res) => {
    let contact = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        phone_no: req.body.phone_no,
        subjects: req.body.subjects,
        message: req.body.message,
    };
    const sql = `INSERT INTO contact_messages 
        (first_name, last_name, email, phone, subject, message) 
        VALUES (?, ?, ?, ?, ?, ?)`;

    // Use db or con depending on what you named your MySQL connection
    con.query(sql, [
        contact.fname,
        contact.lname,
        contact.email,
        contact.phone_no,
        contact.subjects,
        contact.message,
    ], (err, result) => {
        if (err) {
            console.error('Error inserting recipe:', err);
            return res.status(500).send('Database error');
        }
        res.send('Recipe inserted successfully!');
    });
});

//& ****************************************************  File Upload  ******************************************************* 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        // cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
let upload = multer({ storage, fileFilter });

router.post('/submit', upload.single('recipe_img'), (req, res) => {
    const newRecipe = {
        recipe_name: req.body.recipe_name,
        recipe_price: req.body.recipe_price,
        recipe_category: req.body.recipe_category,
        prep_time: req.body.prep_time,
        description: req.body.description,
        recipe_img: req.file.filename,
    };

    const sql = "INSERT INTO view_recipe (recipe_name, price, category, prep_time, description, recipe_img) VALUES (?, ?, ?, ?, ?, ?)";
    con.query(sql, [
        newRecipe.recipe_name,
        newRecipe.recipe_price,
        newRecipe.recipe_category,
        newRecipe.prep_time,
        newRecipe.description,
        newRecipe.recipe_img
    ], (err, result) => {
        if (err) return res.status(500).json(err);
        res.redirect('/dashboard/addRecipe');
        alert("Recipe Saved Successfully.")
    });
});

router.post('/signup', async (req, res) => {
    var signup = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.password,
    };
    try {
        const hashedPassword = await bcrypt.hash(signup.password, 10);
        const sql = "INSERT INTO register (first_name,last_name, email, password) VALUES (?, ?, ?,?)";
        con.query(sql, [signup.fname, signup.lname, signup.email, hashedPassword], (err, result) => {
            if (err) {
                console.error("Error registering user:", err);
                return res.status(500).send("Database error");
            }
            res.send("User registered successfully!");
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});
//& ***************************************************** EDIT RECIPE API ***********************************************************************
// Show Edit Recipe Page with existing values
router.get('/edit/:recipe_id', (req, res) => {

    const recipeId = req.params.recipe_id;

    const sql = `SELECT * FROM view_recipe WHERE recipe_id = ?`;

    con.query(sql, [recipeId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Database error');
        }

        if (result.length === 0) {
            res.send('Recipe not found');
        } else {

            res.render('dashboard/edit_Recipe', { addRecipe: result[0] });
        }

    });
});


//& ***************************************************** UPDATE RECIPE API ***********************************************************************
// Update recipe
router.post('/edit/:recipe_id', upload.single('recipe_img'), (req, res) => {
    const recipeId = req.params.recipe_id;
    const { recipe_name, recipe_price, recipe_category, prep_time, description, current_recipe_img } = req.body;

    // Use new image if uploaded, otherwise keep current image
    let recipe_img = req.file ? req.file.filename : current_recipe_img;

    const sql = `UPDATE view_recipe 
                 SET recipe_name=?, price=?, category=?, prep_time=?, description=?, recipe_img=? 
                 WHERE recipe_id=?`;

    const values = [recipe_name, recipe_price, recipe_category, prep_time, description, recipe_img, recipeId];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Database error');
        }
        res.redirect('/dashboard/viewRecipe');
    });
});

router.get("/delete/:recipe_id", (req, res) => {
    const recipeId = req.params.recipe_id;

    const sql = "DELETE FROM view_recipe WHERE recipe_id = ?"; // 👈 your table & column name

    con.query(sql, [recipeId], (err, result) => {
        if (err) {
            console.error("Error deleting package:", err);
            return res.status(500).send("Database error");
        }

        // If no rows affected → package not found
        if (result.affectedRows === 0) {
            return res.status(404).send("Package not found");
        }

        res.redirect("/dashboard/viewRecipe");
    });
});


router.get('/dashboard/viewRecipe', async (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        try {
            const userEmail = req.session.user.email ||
                (req.session.user.emails ? req.session.user.emails[0].value : null);

            if (!userEmail) return res.redirect('/login');

            // 1. Fetch user
            const [userRows] = await con.promise().query(
                "SELECT * FROM register WHERE email = ?",
                [userEmail]
            );

            const [addRecipe] = await con.promise().query('SELECT * FROM view_recipe');
            res.render('dashboard/index', {
                register: userRows[0],
                addRecipe: addRecipe,
                content: 'viewRecipe.ejs'
            });
            console.log(addRecipe);

        } catch (err) {
            console.log(err);
        }
    } else {
        res.redirect('/login');
    }

});
router.get('/dashboard/viewContact', async (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        try {
            const userEmail = req.session.user.email ||
                (req.session.user.emails ? req.session.user.emails[0].value : null);

            if (!userEmail) return res.redirect('/login');

            // 1. Fetch user
            const [userRows] = await con.promise().query(
                "SELECT * FROM register WHERE email = ?",
                [userEmail]
            );

            const [viewContact] = await con.promise().query('SELECT * FROM contact_messages');
            res.render('dashboard/index', {
                viewContact: viewContact,
                register: userRows[0],
                content: 'viewContact.ejs'
            });
            console.log(viewContact);

        } catch (err) {
            console.log(err);
        }
    } else {
        res.redirect('/login');
    }

});

module.exports = router;