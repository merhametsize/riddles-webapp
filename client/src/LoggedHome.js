'use-strict';
import { Tab, Tabs, ListGroup, Button, Form, Modal, Alert } from 'react-bootstrap';
import { useState } from 'react';

const dayjs = require('dayjs');

function LoggedHome(props) {
    const [key, setKey] = useState('open');

    return (
        <Tabs id="controlled-tab"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3">
            <Tab eventKey="open" title="Aperti">
                <Riddles riddles={props.riddles
                    .filter(r => r.state === "open" && r.userid !== props.user.id)
                    .sort((r1, r2) => r1.id < r2.id)} //Most recent on top
                    answers={props.answers} user={props.user} sendAnswer={props.sendAnswer} />
            </Tab>
            <Tab eventKey="closed" title="Chiusi">
                <Riddles riddles={props.riddles
                    .filter(r => r.state === "closed" && r.userid !== props.user.id)
                    .sort((r1, r2) => r1.id < r2.id)} //Most recent on top
                    answers={props.answers} user={props.user} />
            </Tab>
        </Tabs>
    );
}

function Riddles(props) {
    return (
        <>
            {
                props.riddles.length === 0 ?
                    <h3>Ancora niente, qualcuno pubblicherà qualcosa presto...</h3> :
                    props.riddles.map(r => 
                        <Riddle key={r.id} riddle={r} sendAnswer={props.sendAnswer}
                            user={props.user} answers={props.answers}/>)
            }
        </>
    );
}

function Riddle(props) {
    return (
        <>
            {
                props.riddle.state === "open" ?
                    <OpenRiddle key={props.riddle.id}
                        riddle={props.riddle}
                        answers={props.answers} 
                        sendAnswer={props.sendAnswer} /> :
                    <ClosedRiddle key={props.riddle.id}
                        riddle={props.riddle}
                        wrongAnswers={props.answers.filter(a =>
                            a.riddleid === props.riddle.id &&
                            a.text.toLowerCase() !== props.riddle.answer.toLowerCase())} />
            }
        </>
    );
}

function OpenRiddle(props) {
    const [show, setShow] = useState(false); //For the modal
    const [answer, setAnswer] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSubmit = (event) => {
        event.preventDefault();
        if(answer === "") setErrorMsg("Inserire una risposta valida");
        else {
            props.sendAnswer(props.riddle, answer.toLowerCase().trim());
            setShow(false);
        }
    }

    return (
        <>
            <ListGroup horizontal="xxl" className="my-2">
                {/* Question and difficulty*/}
                <ListGroup.Item variant="primary">{props.riddle.question}</ListGroup.Item>
                <ListGroup.Item>Difficoltà: {props.riddle.difficulty}/3</ListGroup.Item>
                {props.riddle.openingdate ? //If the countdown is active, render countdown and hints
                <>
                    <ListGroup.Item>
                        Tempo rimanente: {props.riddle.duration -
                            parseInt(dayjs().diff(dayjs(props.riddle.openingdate)) / 1000)}
                    </ListGroup.Item>
                    {    //Hint1
                        parseInt(dayjs().diff(dayjs(props.riddle.openingdate))) / 1000 >
                            (props.riddle.duration / 2) ?
                            <ListGroup.Item>Suggerimento: {props.riddle.hint1}</ListGroup.Item> :
                            <></>
                    }
                    {   //Hint2
                        parseInt(dayjs().diff(dayjs(props.riddle.openingdate))) / 1000 >
                        (props.riddle.duration * 2 / 3) ?
                        <ListGroup.Item>Suggerimento: {props.riddle.hint2}</ListGroup.Item> : 
                        <></>
                    }
                </>
                : //Otherwise the duration is displayed
                <ListGroup.Item>
                    <>Durata: {props.riddle.duration}</>
                </ListGroup.Item>
            }
            </ListGroup>

            {   //If the user already answered, the button should disappear
                props.answers.some(a => a.riddleid === props.riddle.id) ?
                <></> : <Button onClick={handleShow}>Rispondi</Button>
            }

            {/* Window to type the answer in*/}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Risposta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMsg ?
                        <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>
                            {errorMsg}
                        </Alert> : false}
                    <Form onSubmit={handleSubmit}>
                        <Form.Control size="sm" onChange={(ev) => setAnswer(ev.target.value)}
                            type="text" placeholder="Risposta" autoFocus />
                        <Button type='submit'>Invia</Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        </>
    );
}

function ClosedRiddle(props) {
    return (
        <ListGroup horizontal="xxl" className="my-2">
            {/* Question and difficulty*/}
            <ListGroup.Item variant="dark">{props.riddle.question}</ListGroup.Item>
            <ListGroup.Item>Difficoltà: {props.riddle.difficulty}/3</ListGroup.Item>
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

export { LoggedHome };