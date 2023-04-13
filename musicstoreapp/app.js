var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Accept, token");
// Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

let jwt = require('jsonwebtoken');
app.set('jwt', jwt);

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

let crypto = require('crypto');

let fileUpload = require('express-fileupload');
app.use(fileUpload({
    limits: {fileSize: 50 * 1024 * 1024},
    createParentPath: true
}));

app.set('uploadPath', __dirname)
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const {MongoClient} = require("mongodb");
//const url = 'mongodb+srv://admin:sdi@eii-sdi-cluster.5o2t719.mongodb.net/?retryWrites=true&w=majority';
const url = 'mongodb://localhost:27017';
app.set('connectionStrings', url);

const userSessionRouter = require('./routes/userSessionRouter');
const userAudiosRouter = require('./routes/userAudiosRouter');
userAudiosRouter.use(function (req, res, next) {
    console.log("routerAudios");
    let path = require('path');
    let songId = path.basename(req.originalUrl, '.mp3');
    let filter = {_id: ObjectId(songId)};
    songsRepository.findSong(filter, {}).then(song => {
        if (req.session.user && song.author == req.session.user) {
            next();
            return;
        } else {
            let filter = {user: req.session.user, songId: ObjectId(songId)};
            let options = {projection: {_id: 0, songId: 1}};
            songsRepository.getPurchases(filter, options).then(purchasedIds => {
                if (purchasedIds !== null && purchasedIds.length > 0) {
                    next();
                    return;
                } else {
                    res.redirect("/shop");
                }
            }).catch(error => {
                res.redirect("/shop");
            });
        }
    }).catch(error => {
        res.redirect("/shop");
    });
});
module.exports = userAudiosRouter;

app.use("/songs/add", userSessionRouter);
app.use("/publications", userSessionRouter);
app.use("/songs/buy", userSessionRouter);
app.use("/purchases", userSessionRouter);
app.use("/audios/", userAudiosRouter);
app.use("/shop/", userSessionRouter)

const userAuthorRouter = require('./routes/userAuthorRouter');
app.use("/songs/edit", userAuthorRouter);
app.use("/songs/delete", userAuthorRouter);

const userTokenRouter = require('./routes/userTokenRouter');
app.use("/api/v1.0/songs/", userTokenRouter);

let songsRepository = require("./repositories/songsRepository");
songsRepository.init(app, MongoClient);

const usersRepository = require("./repositories/usersRepository.js");
usersRepository.init(app, MongoClient);
require("./routes/users.js")(app, usersRepository);

var indexRouter = require('./routes/index');

let commentsRepository = require("./repositories/commentsRepository");
commentsRepository.init(app, MongoClient);

let swig = require("swig");
require("./routes/songs.js")(app, songsRepository, commentsRepository);

require("./routes/api/songsAPIv1.0.js")(app, songsRepository, usersRepository);

require("./routes/comments.js")(app, commentsRepository);
require("./routes/authors")(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    console.log("Se ha producido un error " + err)
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
