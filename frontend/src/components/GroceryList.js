import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Form, ListGroup, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { AuthContext } from './AuthContext';
import { BsCheck2Circle, BsCircle, BsPlusCircle, BsTrash } from 'react-icons/bs';

const GroceryList = () => {
  const { user, access, refresh, login } = useContext(AuthContext);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [groceryLists, setGroceryLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [groceryItems, setGroceryItems] = useState([]);
  const [listName, setListName] = useState('');
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('');

  // Fetch grocery lists
  useEffect(() => {
    const fetchGroceryLists = async () => {
      try {
        const response = await fetch('/api/recipes/grocery-lists/', {
          headers: {
            'Authorization': `Bearer ${access}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch grocery lists');
        }

        const data = await response.json();
        setGroceryLists(data);
      } catch (error) {
        setError(error.message);
      }
    };

    if (user) {
      fetchGroceryLists();
    }
  }, [user, access]);

  // Fetch saved recipes
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        let response = await fetch('/api/recipes/saved-recipes/', {
          headers: {
            'Authorization': `Bearer ${access}`
          }
        });

        if (!response.ok) {
          if (response.status === 401 && refresh) {
            const refreshResponse = await fetch('/api/users/token/refresh/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh })
            });
            
            if (refreshResponse.ok) {
              const tokens = await refreshResponse.json();
              login(tokens.access, refresh);
              
              response = await fetch('/api/recipes/saved-recipes/', {
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

  // Update available ingredients when recipes are selected
  useEffect(() => {
    const ingredients = [];
    selectedRecipes.forEach(recipeId => {
      const savedRecipe = savedRecipes.find(r => r.id === recipeId);
      if (!savedRecipe?.recipe?.converted_ingredients) return;

      const recipeIngredients = savedRecipe.recipe.converted_ingredients
        .split(/\r?\n/)
        .filter(line => line.trim())
        .map(line => {
          const ingredient = line.trim();
          const match = ingredient.match(/^([\d.]+)\s*([a-zA-Z]+)?\s+(.+)$/);
          if (match) {
            const [, quantity, unit, name] = match;
            return {
              id: Math.random().toString(36).substr(2, 9),
              raw: ingredient,
              name: name.toLowerCase(),
              quantity: parseFloat(quantity),
              unit: unit?.toLowerCase() || '',
              recipe: savedRecipe.recipe.title
            };
          } else {
            return {
              id: Math.random().toString(36).substr(2, 9),
              raw: ingredient,
              name: ingredient.toLowerCase(),
              quantity: 1,
              unit: '',
              recipe: savedRecipe.recipe.title
            };
          }
        });
      ingredients.push(...recipeIngredients);
    });

    // Combine similar ingredients
    const combinedIngredients = ingredients.reduce((acc, curr) => {
      const existing = acc.find(item => 
        item.name === curr.name && item.unit === curr.unit
      );
      if (existing) {
        existing.quantity += curr.quantity;
        existing.recipe = `${existing.recipe}, ${curr.recipe}`;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

    setAvailableIngredients(combinedIngredients);
  }, [selectedRecipes, savedRecipes]);

  const createNewList = async () => {
    try {
      const response = await fetch('/api/recipes/grocery-lists/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        body: JSON.stringify({
          name: listName || `Grocery List ${new Date().toLocaleDateString()}`,
          recipe_ids: selectedRecipes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create grocery list');
      }

      const data = await response.json();
      setCurrentList(data);
      setGroceryLists(prev => [...prev, data]);
      setGroceryItems(data.items);
    } catch (error) {
      setError(error.message);
    }
  };

  const addToGroceryList = async (ingredient) => {
    if (!currentList) {
      await createNewList();
    }

    try {
      const response = await fetch(`/api/recipes/grocery-lists/${currentList.id}/items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        body: JSON.stringify({
          ...ingredient,
          id: Math.random().toString(36).substr(2, 9),
          checked: false
        })
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const updateItemQuantity = async (id, newQuantity) => {
    try {
      const response = await fetch(`/api/recipes/grocery-items/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        body: JSON.stringify({ quantity: parseFloat(newQuantity) })
      });

      if (!response.ok) {
        throw new Error('Failed to update item quantity');
      }

      setGroceryItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity: parseFloat(newQuantity) } : item
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleItemChecked = async (itemId) => {
    try {
      const item = groceryItems.find(i => i.id === itemId);
      const response = await fetch(`/api/recipes/grocery-items/${itemId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        body: JSON.stringify({ checked: !item.checked })
      });

      if (!response.ok) {
        throw new Error('Failed to update item status');
      }

      setGroceryItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const newItemObj = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.trim().toLowerCase(),
      quantity: parseFloat(newItemQuantity) || 1,
      unit: newItemUnit.trim().toLowerCase(),
      raw: `${newItemQuantity}${newItemUnit ? ' ' + newItemUnit : ''} ${newItem}`,
      checked: false,
      custom: true
    };
    setGroceryItems(prev => [...prev, newItemObj]);
    setNewItem('');
    setNewItemQuantity(1);
    setNewItemUnit('');
  };

  const removeItem = async (id) => {
    try {
      const response = await fetch(`/api/recipes/grocery-items/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${access}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setGroceryItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRecipeSelect = (recipeId) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
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
    <Container className="mt-4">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      <h2 className="mb-4">Grocery List</h2>
      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Select Recipes</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                {savedRecipes.map(savedRecipe => (
                  <div key={savedRecipe.id} className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label={savedRecipe.recipe.title || 'Untitled Recipe'}
                      checked={selectedRecipes.includes(savedRecipe.id)}
                      onChange={() => handleRecipeSelect(savedRecipe.id)}
                    />
                  </div>
                ))}
              </Form>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h5 className="mb-0">Available Ingredients</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {availableIngredients.map((ingredient) => (
                  <ListGroup.Item
                    key={ingredient.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div>{ingredient.raw}</div>
                      <small className="text-muted">From: {ingredient.recipe}</small>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => addToGroceryList(ingredient)}
                    >
                      <BsPlusCircle /> Add
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h5 className="mb-0">Add Custom Item</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddItem}>
                <Row className="mb-3">
                  <Col xs={4}>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.25"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      placeholder="Qty"
                    />
                  </Col>
                  <Col xs={8}>
                    <Form.Control
                      type="text"
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      placeholder="Unit (optional)"
                    />
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Item name"
                    required
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
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Create or Select List</h5>
            </Card.Header>
            <Card.Body>
              <Row className="align-items-end">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Create New List</Form.Label>
                    <Form.Control
                      type="text"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="Enter list name"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="primary" 
                    onClick={createNewList}
                    className="w-100"
                    disabled={!listName}
                  >
                    Create List
                  </Button>
                </Col>
                <Col md={3}>
                  {groceryLists.length > 0 && (
                    <Form.Select
                      value={currentList?.id || ''}
                      onChange={(e) => {
                        const list = groceryLists.find(l => l.id === parseInt(e.target.value));
                        setCurrentList(list);
                        setGroceryItems(list.items);
                      }}
                    >
                      <option value="">Select a list...</option>
                      {groceryLists.map(list => (
                        <option key={list.id} value={list.id}>{list.name}</option>
                      ))}
                    </Form.Select>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Grocery List {currentList && `- ${currentList.name}`}</h5>
              {currentList && (
                <Button
                  variant="success"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/recipes/grocery-lists/${currentList.id}/`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${access}`
                        }
                      });

                      if (!response.ok) {
                        throw new Error('Failed to complete list');
                      }

                      setGroceryLists(prev => prev.filter(l => l.id !== currentList.id));
                      setCurrentList(null);
                      setGroceryItems([]);
                    } catch (error) {
                      setError(error.message);
                    }
                  }}
                >
                  Complete List
                </Button>
              )}
            </Card.Header>
            <ListGroup variant="flush">
              {groceryItems.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center flex-grow-1">
                    <Button
                      variant="link"
                      className="p-0 me-2"
                      onClick={() => toggleItemChecked(item.id)}
                    >
                      {item.checked ? (
                        <BsCheck2Circle className="text-success" size={20} />
                      ) : (
                        <BsCircle className="text-secondary" size={20} />
                      )}
                    </Button>
                    <div className={item.checked ? 'text-muted text-decoration-line-through' : ''}>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.25"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                          className="me-2"
                          style={{ width: '80px' }}
                        />
                        {item.unit && <span className="me-2">{item.unit}</span>}
                        <span>{item.name}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="text-danger p-0 ms-2"
                    onClick={() => removeItem(item.id)}
                  >
                    <BsTrash size={20} />
                  </Button>
                </ListGroup.Item>
              ))}
              {groceryItems.length === 0 && (
                <ListGroup.Item className="text-center text-muted">
                  No items in your grocery list. Select recipes to add ingredients or add custom items.
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GroceryList;
