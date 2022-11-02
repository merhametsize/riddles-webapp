'use-strict';
import { Form, Row, Col, Alert, Button } from 'react-bootstrap';
import { useState } from 'react';

function RiddleForm(props) {
    const [question, setQuestion] = useState("Può essere molto concentrato, ma non è capace di pensare." );
    const [hint1, setHint1] = useState("È americano");
    const [hint2, setHint2] = useState("È rosso");
    const [answer, setAnswer] = useState("Pomodoro");
    const [difficulty, setDifficulty] = useState(1);
    const [duration, setDuration] = useState(400);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        if (question === "") setErrorMsg("Inserire un indovinello valido");
        else if (hint1 === "" || hint2 === "") setErrorMsg("Inserire suggerimenti validi");
        else if (answer === "") setErrorMsg("Inserire risposta valida");
        else if (difficulty > 3 || difficulty < 1) setErrorMsg("Inserire difficoltà valida");
        else if (duration < 60 || difficulty > 600) setErrorMsg("Inserire durata valida");
        else {
            const newRiddle =
            {
                question: question,
                hint1: hint1,
                hint2: hint2,
                answer: answer,
                difficulty: difficulty,
                duration: duration
            };
            props.postRiddle(newRiddle);
        }
    }

    const handleQuestion = (ev) => {
        const val = ev.target.value;
        setQuestion(val.trim());
    }

    const handleHint1 = (ev) => {
        const val = ev.target.value;
        setHint1(val.trim());
    }

    const handleHint2 = (ev) => {
        const val = ev.target.value;
        setHint2(val.trim());
    }

    const handleAnswer = (ev) => {
        const val = ev.target.value;
        setAnswer(val.trim());
    }

    const handleDifficulty = (ev) => {
        const val = ev.target.value;
        setDifficulty(parseInt(val));
    }

    const handleDuration = (ev) => {
        const val = ev.target.value;
        setDuration(parseInt(val));
    }

    return (
        <>
            {errorMsg ?
                <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>
                    {errorMsg}
                </Alert> : false}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Row>
                        <Col>
                            <br />
                            <Form.Label>Testo dell'indovinello</Form.Label>
                            <Form.Control as="textarea" rows={4}
                                onChange={ev => handleQuestion(ev)}
                                placeholder="Testo dell'indovinello"
                                defaultValue={question}/>
                            <br />
                            <Form.Label>Risposta</Form.Label>
                            <Form.Control size="sm"
                                onChange={ev => handleAnswer(ev)}
                                placeholder="Risposta" 
                                defaultValue={answer}/>
                        </Col>
                        <Col>
                            <br />
                            <Form.Label>I suggerimento</Form.Label>
                            <Form.Control as="textarea" rows={3} defaultValue={hint1}
                                onChange={ev => handleHint1(ev)} placeholder="I suggerimento" />
                            <br />
                            <Form.Label>II suggerimento</Form.Label>
                            <Form.Control as="textarea" rows={3} defaultValue={hint2}
                                onChange={ev => handleHint2(ev)}
                                placeholder="II suggerimento" />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col>
                            <Form.Label>Difficoltà</Form.Label>
                            <Form.Select aria-label="diff-select" onChange={ev => handleDifficulty(ev)}>
                                <option value="1">1/3</option>
                                <option value="2">2/3</option>
                                <option value="3">3/3</option>
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Label>Durata in secondi (min: 60, max: 600)</Form.Label>
                            <Form.Control size="sm"
                                defaultValue={duration.toString()}
                                onChange={ev => handleDuration(ev)}
                                placeholder="Durata" />
                        </Col>
                        <Col>
                        <Button type='submit'>Pubblica</Button>
                        </Col>
                    </Row>
                </Form.Group>
            </Form>
        </>
    );

}

export { RiddleForm };