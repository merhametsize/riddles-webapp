'use-strict';
import { ListGroup } from 'react-bootstrap';

const dayjs = require('dayjs');

function MyRiddles(props) {
    return (
        <>
            {
                props.myRiddles
                .sort((r1, r2) => r1.id < r2.id) //Most recent on top
                .map(r => <MyRiddle key={r.id} riddle={r}
                    wrongAnswers={props.answers.filter(a =>
                        a.riddleid === r.id && 
                        a.text.toLowerCase() !== r.answer.toLowerCase())} />)
            }
        </>
    );
}

function MyRiddle(props) {
    return (
        <>
            {
                props.riddle.state === "open" ?
                    <MyOpenRiddle key={props.riddle.id}
                        riddle={props.riddle}
                        wrongAnswers={props.wrongAnswers} /> :
                    <MyClosedRiddle key={props.riddle.id}
                        riddle={props.riddle}
                        wrongAnswers={props.wrongAnswers} />
            }
        </>
    );
}

function MyOpenRiddle(props) {
    return (
        <ListGroup horizontal="xxl" className="my-2">
            {/* Question */}
            <ListGroup.Item variant="primary">
                {props.riddle.question}
            </ListGroup.Item>
            {/* Correct answer*/}
            <ListGroup.Item>Risposta corretta:
                <font color="green"> '{props.riddle.answer}'</font>
            </ListGroup.Item>
            {/* Answers, if any */}
            <ListGroup.Item>Risposte:
                {props.wrongAnswers.map(a => <WrongAnswer key={a.userid} wrongAnswer={a} />)}
            </ListGroup.Item>
            {props.riddle.openingdate ? //If the countdown is active, render countdown and hints
                <ListGroup.Item>
                    Tempo rimanente: {props.riddle.duration -
                        parseInt(dayjs().diff(dayjs(props.riddle.openingdate)) / 1000)}
                </ListGroup.Item>
                : //Otherwise the duration is displayed
                <ListGroup.Item>
                    <>Durata: {props.riddle.duration}</>
                </ListGroup.Item>
            }
        </ListGroup>
    );
}

function MyClosedRiddle(props) {
    return (
        <ListGroup horizontal="xxl" className="my-2">
            {/* Question */}
            <ListGroup.Item variant="dark">
                {props.riddle.question}
            </ListGroup.Item>
            {/* Correct answer */}
            <ListGroup.Item>Risposta corretta:
                <font color="green"> '{props.riddle.answer}'</font>
            </ListGroup.Item>
            {/* Answers */}
            <ListGroup.Item>Risposte:
                {props.wrongAnswers.map(a => <WrongAnswer key={a.userid} wrongAnswer={a} />)}
            </ListGroup.Item>
            {/* Winner, if any */}
            {
                props.riddle.winnerid ?
                    <ListGroup.Item>
                        Vincitore: <font color="green">{props.riddle.winnerid}</font>
                    </ListGroup.Item> : <></>
            }
        </ListGroup>
    );
}

function WrongAnswer(props) {
    return (
        <font color="red"> '{props.wrongAnswer.text}' </font>
    );
}

export { MyRiddles, WrongAnswer };