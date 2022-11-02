'use-strict';
import { ListGroup } from 'react-bootstrap';

function Home(props) {
    return (
        <>
            {
                props.firstLoad ? <Loading/> : <RiddleList riddles={props.riddles}/>
            }
        </>
    )
}

function RiddleList(props) {
    return (
        <>
            {
                props.riddles.map(r => <Riddle key={r.id} riddle={r}/>)
            }
        </>
    );
}

function Riddle(props) {
    return (
        <ListGroup horizontal="xxl" className="my-2">
            <ListGroup.Item variant={props.riddle.state === "open" ?
                "primary" : "dark"}>
                {props.riddle.question}
            </ListGroup.Item>
            <ListGroup.Item>Difficoltà: {props.riddle.difficulty}/3</ListGroup.Item>
            <ListGroup.Item>Stato: {props.riddle.state === "open" ?
                <>aperto</> :
                <>chiuso</>}
            </ListGroup.Item>
        </ListGroup>
    );
}

function Loading() {
    return (
        <h2>Caricamento...</h2>
    )
}

export { Home };