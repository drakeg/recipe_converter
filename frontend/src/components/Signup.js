import React, { useState } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';

const Signup = ({ show, handleClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        // Try to show backend error message if present
        let backendError = 'Signup failed. Try a different username/email.';
        if (typeof data === 'object') {
          backendError = Object.values(data).join(' ');
        }
        setError(backendError);
        console.error('Signup error:', data);
        return;
      }
      setSuccess(true);
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Signup failed. Network or server error.');
      console.error('Signup exception:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="signupUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="signupEmail" className="mt-2">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="signupPassword" className="mt-2">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </Form.Group>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          {success && <Alert variant="success" className="mt-3">Signup successful! You can now log in.</Alert>}
          <div className="mt-3 text-end">
            <Button type="submit" variant="success" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Signup;
