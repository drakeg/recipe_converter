import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Form, ListGroup, Button, Alert } from 'react-bootstrap';
import { AuthContext } from './AuthContext';

const GroceryList = () => {
  const { user, access, refresh, login } = useContext(AuthContext);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [groceryItems, setGroceryItems] = useState([]);
  const [error, setError] = useState(null);

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
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Select Recipes</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            {savedRecipes.map(savedRecipe => (
              <Form.Check
                key={savedRecipe.id}
                type="checkbox"
                id={`recipe-${savedRecipe.id}`}
                label={savedRecipe.recipe.title || 'Untitled Recipe'}
                checked={selectedRecipes.includes(savedRecipe.id)}
                onChange={() => toggleRecipeSelection(savedRecipe.id)}
                className="mb-2"
              />
            ))}
          </Form>
          <Button
            variant="primary"
            onClick={generateGroceryList}
            disabled={selectedRecipes.length === 0}
            className="mt-3"
          >
            Generate Grocery List
          </Button>
        </Card.Body>
      </Card>

      {groceryItems.length > 0 && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">Grocery List</h5>
          </Card.Header>
          <ListGroup variant="flush">
            {groceryItems.map(item => (
              <ListGroup.Item
                key={item.id}
                className="d-flex align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleItemChecked(item.id)}
              >
                <Form.Check
                  type="checkbox"
                  checked={item.checked}
                  readOnly
                  className="me-3"
                />
                <span style={{ 
                  textDecoration: item.checked ? 'line-through' : 'none',
                  flex: 1
                }}>
                  {item.ingredient}
                  {item.count > 1 && ` (${item.count}x)`}
                </span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}
    </Container>
  );
};

export default GroceryList;
