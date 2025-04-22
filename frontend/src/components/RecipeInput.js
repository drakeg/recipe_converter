import React, { useState } from 'react';
import { Button, Form, Row, Col, Card } from 'react-bootstrap';

import { useRecipe } from './RecipeContext';

const RecipeInput = () => {
  const { handleConvert } = useRecipe();
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConvert({ title, ingredients, instructions });
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Recipe Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a name for your recipe"
              required
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group controlId="ingredients">
                <Form.Label>Ingredients</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Paste or type your ingredients here..."
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="instructions">
                <Form.Label>Instructions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Paste or type your instructions here..."
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="mt-3 text-end">
            <Button variant="success" type="submit">
              Convert to Healthy Recipe
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RecipeInput;
