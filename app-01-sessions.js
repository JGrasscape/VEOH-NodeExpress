const express = require('express');
const PORT = process.env.PORT || 8080;
const body_parser = require('body-parser');
const session = require('express-session'); // terminal: npm install express-session

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
    // Löytyykö käyttäjä jo
    let user = users.find((name) => {
        return user_name == name;
    });
    // Käyttäjä löytyi
    if (user) {
        //return res.send('User name already registered.');
        console.log('User logged in:', user);
        req.session.user = user;
        return res.redirect('/login');
    }
    console.log('User not registered:', user);
    res.redirect('/login');
});

app.post('/register', (req, res, next) => {
    const user_name = req.body.user_name;
    // Löytyykö käyttäjä jo
    let user = users.find((name) => {
        return user_name == name;
    });
    // Käyttäjä löytyi, virhetilanne
    if (user) {
        return res.send('User name already registered.');
    }
    users.push(user_name);
    console.log('users:', users);
    res.redirect('/login');
});

app.use((req, res, next) => {
    console.log('404');
    res.status(404);
    res.send('404');
    res.end();
});

app.listen(PORT);
