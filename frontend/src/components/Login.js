import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Button, Form, Modal, Alert } from 'react-bootstrap';

const Login = ({ show, handleClose }) => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      login(data.access, data.refresh);
      handleClose();
    } catch (err) {
      setError('Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="loginUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="loginPassword" className="mt-2">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </Form.Group>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          <div className="mt-3 text-end">
            <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Login;
