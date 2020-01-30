const express = require('express');
const PORT = process.env.PORT || 8080;
const body_parser = require('body-parser');
const session = require('express-session'); // terminal: npm install express-session
const mongoose = require('mongoose'); // terminal: npm install mongoose
const Schema = mongoose.Schema;

const user_schema = new Schema({
    name: {
        type: String,
        required: true
    }
});

const user_model = mongoose.model('user', user_schema);

let app = express();

app.use(body_parser.urlencoded({
    extended: true
}));

app.use(session({
    secret: '1234qwerty',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000000
    }
}));

let users = [];

app.use((req, res, next) => {
    console.log('PATH: ' + req.path);
    next();
});

const is_logged_handler = (req, res, next) => {
    // Ei kirjautunutta käyttäjää
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Haetaan käyttäjän tietokanta-objekti
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    user_model.findById(req.session.user._id).then((user) => {
        req.user = user;
        next();
    });
});

app.get('/', is_logged_handler, (req, res, next) => {
    //const user = req.session.user;
    const user = req.user;
    res.write(`
        <html>
        <body>
            Logged in as user: ${user.name}
            <form action="/logout" method="POST">
                <button type="submit">Log out</button>
            </form>
        </body>
        </html>
    `);
    res.end();
});

app.post('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/login', (req, res, next) => {
    console.log('user:', req.session.user);
    res.write(`
        <html>
        <body>
            <form action="/login" method="POST">
                <input type="text" name="user_name">
                <button type="submit">Log in</button>
            </form>
            <form action="/register" method="POST">
                <input type="text" name="user_name">
                <button type="submit">Register</button>
            </form>
        </body>
        </html>
    `);
    res.end();
});

app.post('/login', (req, res, next) => {
    const user_name = req.body.user_name;
    // Etsitään käyttäjää MongoDB:stä
    user_model.findOne({
        name: user_name
    }).then((user) => {
        if (user) {
            req.session.user = user;
            return res.redirect('/');
        }
        res.redirect('/login');
    });

    // // Löytyykö käyttäjä jo
    // let user = users.find((name) => {
    //     return user_name == name;
    // });
    // // Käyttäjä löytyi
    // if (user) {
    //     //return res.send('User name already registered.');
    //     console.log('User logged in:', user);
    //     req.session.user = user;
    //     return res.redirect('/');
    // }
    // console.log('User not registered:', user);
    // res.redirect('/login');
});

app.post('/register', (req, res, next) => {
    const user_name = req.body.user_name;
    // Etsitään käyttäjää MongoDB:stä
    user_model.findOne({
        name: user_name
    }).then((user) => {
        if (user) {
            console.log('User name already registered');
            return res.redirect('/login');
        }

        let new_user = new user_model({
            name: user_name
        });

        new_user.save().then(() => {
            return res.redirect('/login');
        });
    });

    // // Löytyykö käyttäjä jo paikalliselta listalta
    // let user = users.find((name) => {
    //     return user_name == name;
    // });
    // // Käyttäjä löytyi, virhetilanne
    // if (user) {
    //     return res.send('User name already registered.');
    // }
    // users.push(user_name);    
    // console.log('users:', users);
    // res.redirect('/login');
});

app.use((req, res, next) => {
    console.log('404');
    res.status(404);
    res.send('404');
    res.end();
});

// yhteys tietokantaan
// 1X5P8Y6oTPpOfpms
// mongodb+srv://db-user:<password>@cluster0-zf1di.mongodb.net/test?retryWrites=true&w=majority
const mongoose_url = 'mongodb+srv://db-user:1X5P8Y6oTPpOfpms@cluster0-zf1di.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(mongoose_url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    // serverin käynnistys
    console.log('Mongoose connected');
    console.log('Start Express server');
    app.listen(PORT);
});
