'use-strict';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Home } from './Home.js'
import { Col, Alert, Row, Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { useNavigate, Navigate } from 'react-router-dom';
import { Charts } from './Charts.js'
import { LoginForm } from './LoginComponents.js';
import { MyRiddles } from './MyRiddles.js';
import { LoggedHome } from './LoggedHome.js';
import { RiddleForm } from './PublishRiddle.js';
import API from './API.js'

function App() {
  return (
    <Router>
      <App2/>
    </Router>
  );
}

function App2() {
  const [firstLoad, setFirstLoad] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [message, setMessage] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [intervalID, setIntervalID] = useState(0);

  const [riddles, setRiddles] = useState([]);
  const [myRiddles, setMyRiddles] = useState([]); //Current user's riddles
  const [answers, setAnswers] = useState([]);    //Answers to user's riddles or to closed riddles

  const navigate = useNavigate();

  //Fetches the riddle list when loading
  useEffect(() => {
    API.getRiddleList()
      .then(riddles => { setRiddles(riddles); setFirstLoad(false);})
      .catch(err => handleError(err));
  }, []);

  //Refreshes riddles and answers every second when logged in
  useEffect(() => {
    const fetchData = async () => {
      try {
        let refreshedRiddles = await API.getRiddles(); 
        let refreshedAnswers = await API.getAnswers(); 
        let refreshedMyRiddles = refreshedRiddles.filter(r => r.userid === user.id)

        setRiddles(refreshedRiddles);
        setAnswers(refreshedAnswers);
        setMyRiddles(refreshedMyRiddles);
      } catch (err) {handleError(err);}
    }
    if (loggedIn) {
      fetchData();
      setIntervalID(setInterval(() => fetchData(), 1000));
    }
  }, [loggedIn]);

  const handleError = (err) => {
    setErrorMsg(err);
    setTimeout(() => setErrorMsg(""), 2000);
  }

  const postRiddle = async (riddle) => {
    try { await API.postRiddle(riddle); }
    catch (err) { handleError(err); }
    navigate('/');
    setMessage("Indovinello pubblicato");
    setTimeout(() => setMessage(""), 2000);
  }

  const sendAnswer = async (riddle, answer) => {
    let result = await API.postAnswer(riddle.id, answer);
    if(result === "correct") setMessage(`Risposta corretta! +${riddle.difficulty} punti`);
    else setErrorMsg("Risposta sbagliata");
    setTimeout(() => {setMessage(""); setErrorMsg("");}, 2000);
  }

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setErrorMsg('');
        navigate('/');
      })
      .catch(err => setErrorMsg(err));
  }

  const doLogOut = () => {
    setLoggedIn(false);
    clearInterval(intervalID);
    setMessage(""); setErrorMsg("");
    setTimeout(async () => {await API.logOut();}, 600); //Waits for loggedIn to be set to false
    setUser({});
    navigate('/');
  }

  return (
    <>
      <IndovinelliBar user={user} loggedIn={loggedIn} doLogOut={doLogOut}/>

      <Row><Col> {errorMsg ?
        <Alert variant='danger' onClose={() => setErrorMsg("")} dismissible>
          {errorMsg}
        </Alert> : message ?
          <Alert variant='success' onClose={() => setMessage("")} dismissible>
            {message}
          </Alert> : <></>
      }
      </Col></Row>

      <Routes>
        <Route path='/' element={loggedIn ?
          <LoggedHome riddles={riddles} answers={answers} user={user} sendAnswer={sendAnswer}/> :
          <Home riddles={riddles} firstLoad={firstLoad} />} />
        <Route path='/charts' element={<Charts />} />
        <Route path='/login' element={loggedIn ? <Navigate to='/' /> :
          <LoginForm login={doLogIn} />} />
        <Route path='/myriddles'
          element={<MyRiddles myRiddles={myRiddles} answers={answers} user={user} />} />
        <Route path='/newriddle' element={<RiddleForm postRiddle={postRiddle}/>}/>
      </Routes>
    </>
  )
}

function IndovinelliBar(props) {
  const navigate = useNavigate();

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand>Indovinelli</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link onClick={() => navigate('/')}>Home</Nav.Link>
          <Nav.Link onClick={() => navigate('/charts')}>Classifica</Nav.Link>
          {
            props.loggedIn ?
              <>
                <NavDropdown title="I miei indovinelli" id="collapsible-nav-dropdown">
                  <NavDropdown.Item onClick={() => navigate('/newriddle')}>
                    Crea
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigate('/myriddles')}>
                    Cronologia
                  </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link onClick={() => {props.doLogOut();}}>Logout</Nav.Link>
              </> :
              <Nav.Link onClick={() => { navigate('/login') }}>Accedi</Nav.Link>
          }
        </Nav>
        <Nav className="mr-auto">{props.loggedIn ?
          <Navbar.Text>Benvenuto <a href="#login">{props.user.id}</a></Navbar.Text> : <></>}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default App;
