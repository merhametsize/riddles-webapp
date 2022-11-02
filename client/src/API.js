'use-strict';

const APIURL = new URL('http://localhost:3001/api/');

//Gets a minimal list of riddles with only a few fields (state, question etc.) for
//the unauthenticated home page
async function getRiddleList() {
    // call: GET /api/riddlelist
    const response = await fetch(new URL('riddlelist', APIURL), { credentials: 'include' });
    const riddlesJson = await response.json();
    if (response.ok) {
        return riddlesJson.map((r) => ({
            id: r.id,
            state: r.state,
            question: r.question,
            difficulty: r.difficulty,
        }));
    } else {
        throw riddlesJson; 
    }
}

//Gets the whole list of riddles, answers are only provided for riddles that are closed
//or that were posted by the authenticated user
async function getRiddles() {
    // call: GET /api/riddles
    const response = await fetch(new URL('riddles', APIURL), { credentials: 'include' });
    const riddlesJson = await response.json();
    if (response.ok) {
        return riddlesJson.map((r) => ({
            id: r.id,
            userid: r.userid,
            state: r.state,
            question: r.question,
            answer: r.answer,
            hint1: r.hint1,
            hint2: r.hint2,
            duration: r.duration,
            openingdate: r.openingdate,
            difficulty: r.difficulty,
            winnerid: r.winnerid
        }));
    } else {
        throw riddlesJson; 
    }
}

async function getCharts() {
    // call: GET /api/charts
    const response = await fetch(new URL('charts', APIURL), { credentials: 'include' });
    const usersJson = await response.json();
    if (response.ok) {
        return usersJson.map((u) => ({
            id: u.id,
            score: u.score
        }));
    } else {
        throw usersJson; 
    }
}

async function getAnswers() {
    // call: GET /api/answers
    const response = await fetch(new URL('answers', APIURL), { credentials: 'include' });
    const answersJson = await response.json();
    if (response.ok) {
        return answersJson.map((a) => ({
            riddleid: a.riddleid,
            userid: a.userid,
            text: a.text
        }));
    } else {
        throw answersJson; 
    }
}

function postRiddle(riddle) {
    // call: POST /api/riddles
    return new Promise((resolve, reject) => {
        fetch(new URL('riddles', APIURL), {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: riddle.question,
                hint1: riddle.hint1,
                hint2: riddle.hint2,
                answer: riddle.answer,
                difficulty: riddle.difficulty,
                duration: riddle.duration
            }),
        }).then((response) => {
            if (response.ok) resolve(null);
            else {
                response.json()
                    .then((message) => { reject(message); })
                    .catch(() => { reject({ error: "Cannot parse server response." }) });
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
    });
}

function postAnswer(riddleid, answer) {
    // call: POST /api/answer
    return new Promise((resolve, reject) => {
        fetch(new URL('answer', APIURL), {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                riddleid: riddleid,
                text: answer
            }),
        }).then((response) => {
            if (response.ok) {
                response.json()
                    .then(rJson => {if(rJson.correct === "yes") resolve("correct"); 
                                    else resolve("incorrect");})
                    .catch(() => { reject({ error: "Cannot parse server response." }) });
            }
            else {
                response.json()
                    .then((message) => { reject(message); })
                    .catch(() => { reject({ error: "Cannot parse server response." }) });
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
    });
}

async function logIn(credentials) {
    let response = await fetch(new URL('sessions', APIURL), {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function logOut() {
    await fetch(new URL('sessions/current', APIURL), { method: 'DELETE', credentials: 'include' });
}

async function getUserInfo() {
    const response = await fetch(new URL('sessions/current', APIURL), { credentials: 'include' });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo; 
    }
}

const API = { getRiddleList, getRiddles, getCharts, logIn, logOut, getUserInfo, 
              getAnswers, postRiddle, postAnswer };
export default API;