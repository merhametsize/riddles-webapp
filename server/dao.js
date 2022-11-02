'use strict';

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

const db = new sqlite.Database('riddles.db', (err) => {
    if (err) throw err;
});

exports.listRiddles = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM riddles';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            //Only minimal fields for the unauthenticated home page
            const riddles = rows.map((r) => ({
                id: r.id,
                state: r.state,
                question: r.question,
                difficulty: r.difficulty,
            }));
            resolve(riddles);
        });
    });
};

exports.getRiddles = (userid) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM riddles';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            //The answer is only provided for riddles that are closed or were published by 
            //userid to prevent cheating
            const riddles = rows.map((r) => ({
                id: r.id,
                userid: r.userid,
                state: r.state,
                question: r.question,
                hint1: r.hint1,
                hint2: r.hint2,
                answer: r.state==="closed" || r.userid===userid ? r.answer : undefined,
                duration: r.duration,
                openingdate: r.openingdate,
                difficulty: r.difficulty,
                winnerid: r.winnerid
            }));
            resolve(riddles);
        });
    });
};

exports.listCharts = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, score FROM users';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const users = rows.map((u) => ({
                id: u.id,
                score: u.score
            }));
            resolve(users);
        });
    });
};

//Gets the answers for the user's riddles, to every closed riddle and the
//answers that the logged user has submitted. All the other answers are not
//provided by the server to prevent cheating
exports.listAnswers = (userid) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM answers WHERE riddleid IN \
                    (SELECT id FROM riddles WHERE userid = ?) \
                    OR riddleid IN \
                    (SELECT id FROM riddles WHERE state = \'closed\') \
                    OR userid = ?';
        db.all(sql, [userid, userid], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const answers = rows.map((a) => ({
                riddleid: a.riddleid,
                userid: a.userid,
                text: a.text
            }));
            resolve(answers);
        });
    });
};

// Posts a new ridde
exports.postRiddle = (r, userid) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO riddles(userid, state, question, difficulty, openingdate, \
                     duration, answer, hint1, hint2, winnerid) \
                     VALUES(?, \'open\', ?, ?, NULL, ?, ?, ?, ?, NULL)';
        db.run(sql, [userid, r.question, r.difficulty, 
                     r.duration, r.answer, r.hint1, r.hint2], function (err) {
            if (err) {
                reject(err);
                return;
            }
            console.log('postRiddle lastID: ' + this.lastID);
            resolve(this.lastID);
        });
    });
};

// Posts a new answer
exports.postAnswer = (a, userid) => {
    //Called after POST /api/answer
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO answers(riddleid, userid, text) VALUES(?, ?, ?)';
        db.run(sql, [a.riddleid, userid, a.text], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(a.riddleid);
        });
    });
};

// Checks whether the logged user has already given an answer to a certain riddle
exports.hasUserAlreadyAnswered = (riddleid, userid) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM answers WHERE riddleid=? AND userid=?';
        db.get(sql, [riddleid, userid], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if(row) resolve(true); //already answered
            else resolve(false);
        });
    });
};

//Called before posting an answer to a riddle. The state is used to check whether
//the riddle is open or not, in order to prevent clients from sending illicit requests.
//The openingdate is used to check whether the countdown has already started or not.
//The duration is used to set a timeout for the closure of the riddle.
//The difficulty is used to update the user's score if the answer is correct.
exports.fetchData = (riddleid) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT state, openingdate, duration, answer, difficulty FROM riddles WHERE id=?';
        db.get(sql, [riddleid], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            const data =
            {
                state: row.state,
                openingdate: row.openingdate,
                duration: row.duration,
                answer: row.answer,
                difficulty: row.difficulty
            };
            resolve(data);
        });
    });
};

//Updates the timestamp from which the countdown starts
exports.updateCountdownTimestamp = (riddleid) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE riddles SET openingdate=? WHERE id=?';
        db.run(sql, [dayjs().format(), riddleid], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
};

//Sets the winner of a riddle
exports.setWinner = (riddleid, userid) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE riddles SET winnerid=? WHERE id=?';
        db.run(sql, [userid, riddleid], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
};

//Closes the riddle, called when the countdown reaches 0
exports.updateScore = (userid, score) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET score=score+? WHERE id=?';
        db.run(sql, [score, userid], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
};

//Closes the riddle, called when the countdown reaches 0
exports.closeRiddle = (riddleid) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE riddles SET state=\'closed\' WHERE id=?';
        db.run(sql, [riddleid], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
};