'use-strict';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';

function LoginForm(props) {
    const [username, setUsername] = useState('gabri98');
    const [password, setPassword] = useState('password');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');
        const credentials = { username, password };

        let valid = true;
        if (username === '' || password === '')
            valid = false;

        if (valid) props.login(credentials);
        else setErrorMessage("Dati d'accesso invalidi");
    };

    return (
        <Container>
            <Row>
                <Col>
                    <h2>Accedi</h2>
                    <Form onSubmit={handleSubmit}>
                        {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
                        <Form.Group controlId='username'>
                            <Form.Label>Utente</Form.Label>
                            <Form.Control value={username} onChange={ev => setUsername(ev.target.value)} />
                        </Form.Group>
                        <Form.Group controlId='password'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                        </Form.Group>
                        <Button type='submit'>Accedi</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export { LoginForm };