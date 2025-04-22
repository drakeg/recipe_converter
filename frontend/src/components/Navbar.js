import React, { useContext, useState } from 'react';
import { Navbar, Nav, Button, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Login from './Login';
import Signup from './Signup';

const AppNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Link to="/" className="navbar-brand">Healthy Recipe Converter</Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {user?.paid_subscription && (
                <>
                  <Link to="/saved-recipes" className="nav-link">Saved Recipes</Link>
                  <Link to="/grocery-list" className="nav-link">Grocery List</Link>
                  <Link to="/meal-planner" className="nav-link">Meal Planner</Link>
                </>
              )}
            </Nav>
            <Nav>
              {user ? (
                <>
                  <NavDropdown title={`${user.user.username}${user.paid_subscription ? ' (Paid)' : ''}`} id="user-dropdown" className="me-2">
                    <NavDropdown.Item href="#profile">Profile</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => setShowLogin(true)}>Login</Button>
                  <Button variant="success" size="sm" onClick={() => setShowSignup(true)}>Sign Up</Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Login show={showLogin} handleClose={() => setShowLogin(false)} />
      <Signup show={showSignup} handleClose={() => setShowSignup(false)} />
    </>
  );
};

export default AppNavbar;
