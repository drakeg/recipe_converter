import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Form, ListGroup, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { AuthContext } from './AuthContext';
import { BsCheck2Circle, BsCircle, BsPlusCircle, BsTrash } from 'react-icons/bs';

const GroceryList = () => {
  const { user, access, refresh, login } = useContext(AuthContext);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [groceryItems, setGroceryItems] = useState([]);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');

  // Fetch saved recipes
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        let response = await fetch('http://localhost:8000/api/recipes/saved-recipes/', {
          headers: {
            'Authorization': `Bearer ${access}`
          }
        });

        if (!response.ok) {
          if (response.status === 401 && refresh) {
            const refreshResponse = await fetch('http://localhost:8000/api/users/token/refresh/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh })
            });
            
            if (refreshResponse.ok) {
              const tokens = await refreshResponse.json();
              login(tokens.access, refresh);
              
              response = await fetch('http://localhost:8000/api/recipes/saved-recipes/', {
                headers: {
                  'Authorization': `Bearer ${tokens.access}`
                }
              });
            }
          }
          
          if (!response.ok) {
            throw new Error('Failed to fetch saved recipes');
          }
        }

        const data = await response.json();
        setSavedRecipes(data);
      } catch (error) {
        setError(error.message);
      }
    };

    if (user) {
      fetchSavedRecipes();
    }
  }, [user, access, refresh, login]);

  // Parse ingredients and combine similar items
  const generateGroceryList = () => {
    const itemMap = new Map();

    selectedRecipes.forEach(recipeId => {
      const recipe = savedRecipes.find(r => r.id === recipeId)?.recipe;
      if (!recipe) return;

      const ingredients = recipe.converted_ingredients.split(/\r?\n/).filter(line => line.trim()).filter(Boolean);
      ingredients.forEach(ingredient => {
        // Basic ingredient parsing (can be enhanced later)
        const cleanIngredient = ingredient.trim().toLowerCase();
        if (cleanIngredient) {
          const amount = itemMap.get(cleanIngredient) || 0;
          itemMap.set(cleanIngredient, amount + 1);
        }
      });
    });

    const items = Array.from(itemMap.entries()).map(([ingredient, count]) => ({
      id: Math.random().toString(36).substr(2, 9),
      ingredient,
      count,
      checked: false
    }));

    setGroceryItems(items);
  };

  const toggleRecipeSelection = (recipeId) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const toggleItemChecked = (itemId) => {
    setGroceryItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, checked: !item.checked }
          : item
      )
    );
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const newItemObj = {
      id: Math.random().toString(36).substr(2, 9),
      ingredient: newItem,
      count: 1,
      checked: false
    };
    setGroceryItems(prev => [...prev, newItemObj]);
    setNewItem('');
  };

  const removeItem = (index) => {
    setGroceryItems(prev => prev.filter((item, i) => i !== index));
  };

  const handleRecipeSelect = (recipeId) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const toggleItemCheck = (index) => {
    setGroceryItems(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, checked: !item.checked }
          : item
      )
    );
  };

  // Group items by category
  const groupedItems = groceryItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Category order and colors
  const categoryOrder = [
    'Produce',
    'Meat',
    'Dairy',
    'Grains',
    'Canned Goods',
    'Condiments',
    'Spices',
    'Other'
  ];

  const categoryColors = {
    'Produce': 'success',
    'Meat': 'danger',
    'Dairy': 'info',
    'Grains': 'warning',
    'Canned Goods': 'secondary',
    'Condiments': 'primary',
    'Spices': 'dark',
    'Other': 'light'
  };

  if (!user?.paid_subscription) {
    return (
      <Container>
        <Alert variant="warning">
          This feature requires a paid subscription.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Grocery List</h2>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Select Recipes</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                {savedRecipes.map(savedRecipe => (
                  <Form.Check
                    key={savedRecipe.id}
                    type="checkbox"
                    label={savedRecipe.recipe.title || 'Untitled Recipe'}
                    checked={selectedRecipes.includes(savedRecipe.id)}
                    onChange={() => handleRecipeSelect(savedRecipe.id)}
                  />
                ))}
              </Form>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h5 className="mb-0">Add New Item</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddItem}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="2 cups milk"
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100">
                  <BsPlusCircle className="me-2" />
                  Add Item
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {categoryOrder.map(category => {
            const items = groupedItems[category] || [];
            if (items.length === 0) return null;

            return (
              <Card key={category} className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{category}</h5>
                  <Badge bg={categoryColors[category]}>{items.length}</Badge>
                </Card.Header>
                <ListGroup variant="flush">
                  {items.map((item, index) => (
                    <ListGroup.Item
                      key={index}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        <Button
                          variant="link"
                          className="p-0 me-2"
                          onClick={() => toggleItemCheck(index)}
                        >
                          {item.checked ? (
                            <BsCheck2Circle className="text-success" size={20} />
                          ) : (
                            <BsCircle className="text-secondary" size={20} />
                          )}
                        </Button>
                        <span className={item.checked ? 'text-muted text-decoration-line-through' : ''}>
                          {item.count > 1 && `${item.count}x `}
                          {item.ingredient}
                        </span>
                      </div>
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => removeItem(index)}
                      >
                        <BsTrash size={20} />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            );
          })}
        </Col>
      </Row>
    </Container>
  );
};

export default GroceryList;
