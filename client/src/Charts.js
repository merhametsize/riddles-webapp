'use-strict';
import { useEffect, useState } from 'react';
import { Table, Col, Row, Alert } from 'react-bootstrap';
import API from './API.js';

function Charts(props) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [top3Users, setTop3Users] = useState([]);
    const [message, setMessage] = useState("");

    const filterToTop3 = (users) => {
        setTop3Users([]);
        for (let i of [1, 2, 3]) {
            let topUser = users.reduce((a, b) => { return a.score > b.score ? a : b });
            let targetUsers = users.filter(u => u.score === topUser.score);
            targetUsers.forEach(u => {
                setTop3Users(top3Users => [...top3Users, {pos: i, id: u.id, score: u.score}])
            });
            users = users.filter(u => u.score !== topUser.score);
        }
    }

    useEffect(() => {
        API.getCharts()
            .then(users => { filterToTop3(users); setFirstLoad(false); })
            .catch(err => setMessage(err));
    }, []);

    return (
        <>
            <Row><Col> {message ?
                <Alert variant='danger' onClose={() => setMessage("")} dismissible>
                    {message}
                </Alert> : false}
            </Col></Row>
            {
                firstLoad ? <Loading /> :
                    <Table striped bordered hover variant="dark">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Utente</th>
                                <th>Punteggio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                top3Users.map(u => <UserRow key={u.id} user={u}/>)
                            }
                        </tbody>
                    </Table>
            }
        </>
    );
}

function UserRow(props) {
    return (
        <tr>
            <th>{props.user.pos}</th>
            <th>{props.user.id}</th>
            <th>{props.user.score}</th>
        </tr>
    );
}

function Loading() {
    return (
        <h2>Caricamento...</h2>
    )
}

export { Charts };