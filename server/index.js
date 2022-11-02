'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB
const cors = require('cors');

passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user) return done(null, false, { message: 'Incorrect username and/or password.' });
      return done(null, user);
    })
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user);
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = new express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
  secret: 'ma quindi qua si mettono gli easter eggs?',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** APIs ***/

// GET /api/riddlelist
app.get('/api/riddlelist', async (req, res) => {
  await dao.listRiddles()
    .then(riddles => res.json(riddles))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: `Database error while retrieving the list of riddles` }).end()
    });
});

// GET /api/riddles
app.get('/api/riddles', isLoggedIn, async (req, res) => {
  await dao.getRiddles(req.user.id)
    .then(riddles => res.json(riddles))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: `Database error while retrieving riddles` }).end()
    });
});

// GET /api/charts
app.get('/api/charts', async (req, res) => {
  await dao.listCharts()
    .then(users => res.json(users))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: `Database error while retrieving charts` }).end()
    });
});

// GET /api/answers
app.get('/api/answers', isLoggedIn, async (req, res) => {
  await dao.listAnswers(req.user.id)
    .then(answers => res.json(answers))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: `Database error while retrieving answers` }).end()
    });
});

// POST /api/riddles
app.post('/api/riddles', isLoggedIn, [check('question').isLength({min: 3, max: 100}),
                                      check('hint1').isLength({min: 1, max: 30}),
                                      check('hint2').isLength({min: 1, max: 30}),
                                      check('answer').isLength({min: 1, max: 20}),
                                      check('difficulty').isInt({min: 1, max: 3}),
                                      check('duration').isInt({min: 60, max: 600})], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const riddle = {
      question: req.body.question,
      hint1: req.body.hint1,
      hint2: req.body.hint2,
      answer: req.body.answer,
      difficulty: req.body.difficulty,
      duration: req.body.duration
    };

    try {
      await dao.postRiddle(riddle, req.user.id);
      res.status(201).end();
    } catch (err) {
      console.log(err);
      res.status(503).json({ error: `Database error during the creation of the \
                                     riddle: \'${riddle.question}\'.` });
    }
  }
);

// POST /api/answer
app.post('/api/answer', isLoggedIn, [check('riddleid').isInt(),
                                      check('text').isLength({min: 2, max: 20})], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const answer = {
      riddleid: req.body.riddleid,
      text: req.body.text,
    };

    try {
      let alreadyAnswered = await dao.hasUserAlreadyAnswered(answer.riddleid, req.user.id);
      if (alreadyAnswered) throw 'The user has already posted an answer for this riddle';

      let data = await dao.fetchData(answer.riddleid);
      if (data.state === "closed") throw 'The riddle is not open to receive any answer';

      await dao.postAnswer(answer, req.user.id);
      let isAnswerCorrect = (answer.text.toLowerCase() === data.answer.toLowerCase());

      //If the timestamp is null and the answer is not correct, let the countdown start,
      //then close the riddle
      if (!data.openingdate && !isAnswerCorrect) {
        await dao.updateCountdownTimestamp(answer.riddleid);
        setTimeout(() => dao.closeRiddle(answer.riddleid), data.duration*1000);
      }

      if(isAnswerCorrect) {
        await dao.updateCountdownTimestamp(answer.riddleid);
        await dao.setWinner(answer.riddleid, req.user.id);
        await dao.closeRiddle(answer.riddleid);
        await dao.updateScore(req.user.id, data.difficulty);
        res.status(201).json({correct: "yes"}).end();
      }
      else res.status(201).json({correct: "no"}).end();
    } catch (err) {
      console.log(err);
      res.status(503).json({
        error: `Database error during the publication of the answer: \'${answer.text}\'.`
      });
    }
  }
);

/*** User APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(info); 

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user' });;
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});