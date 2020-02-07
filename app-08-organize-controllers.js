const express = require('express');
const PORT = process.env.PORT || 8080;
const body_parser = require('body-parser');
const session = require('express-session'); // terminal: npm install express-session
const mongoose = require('mongoose'); // terminal: npm install mongoose
//const Schema = mongoose.Schema;

// Controllers
const auth_controller = require('./controllers/auth_controller');

// Models
const user_model = require('./models/user-model');
const note_model = require('./models/note-model');

// Views
const auth_views = require('./views/auth-views');
const note_views = require('./views/note-views');

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

// Auth
app.get('/login', auth_controller.get_login);
app.post('/logout', auth_controller.post_logout);
app.post('/login', auth_controller.post_login);
app.post('/register', auth_controller.post_register);

// Haetaan käyttäjän tietokanta-objekti
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    user_model.findById(req.session.user._id).then((user) => {
        req.user = user;
        next();
    }).catch((err) => {
        console.log(err);
        res.redirect('/login');
    });
});

app.get('/', is_logged_handler, (req, res, next) => {
    //const user = req.session.user;
    const user = req.user;
    // Popouloidaan userin notes-lista ja renderöidään sivu
    user.populate('notes').execPopulate().then(() => {
        console.log('user:', user);
        //res.send(note_views.notes_view({
        let data = {
            user_name: user.name,
            notes: user.notes
        }
        //}));
        let html = note_views.notes_view(data);
        res.send(html);
    });
});

app.post('/add_note', (req, res, next) => {
    const user = req.user;

    let new_note = note_model({
        text: req.body.note
    });
    new_note.save().then(() => {
        console.log('note saved');
        user.notes.push(new_note); // Lisätään viittaus käyttäjäobjektin notes-listaan
        user.save().then(() => {
            console.log('user saved');
            return res.redirect('/');
        });
    });
});

app.post('/delete_note', (req, res, next) => {
    const user = req.user;
    const note_id_to_delete = req.body.note_id; // hidden inputin name

    // Remove note from user.notes
    const updated_notes = user.notes.filter((note_id) => { // Käy listaa läpi
        // Palauttaa true or false;
        // Jos true, häviää listalta
        return note_id != note_id_to_delete;
    });
    user.notes = updated_notes;

    user.save().then(() => {
        // Käyttäjät päivitetty, viittaus notesiin poistettu. Itse note vielä olemassa kannassa.
        // Poistetaan itse note.
        note_model.findByIdAndRemove(note_id_to_delete).then(() => {
            res.redirect('/');
        });        
    });
});

// Yksittäisen noten haku
app.get('/note/:id', (req, res, next) => {
    const note_id = req.params.id;
    note_model.findOne({
        _id: note_id
    }).then((note) => {
        res.send(note.text);
    });
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
