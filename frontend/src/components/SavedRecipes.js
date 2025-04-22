import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Row, Col, Table, Alert } from 'react-bootstrap';
import { AuthContext } from './AuthContext';

const SavedRecipes = () => {
  const { user, access, refresh, login } = useContext(AuthContext);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);

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
            // Try to refresh the token
            const refreshResponse = await fetch('http://localhost:8000/api/users/token/refresh/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh })
            });
            
            if (refreshResponse.ok) {
              const tokens = await refreshResponse.json();
              login(tokens.access, refresh);
              
              // Retry the fetch with new token
              response = await fetch('/api/recipes/saved-recipes/', {
                headers: {
                  'Authorization': `Bearer ${tokens.access}`
                }
              });
              
              if (!response.ok) {
                throw new Error('Failed to fetch saved recipes after token refresh');
              }
            } else {
              throw new Error('Failed to refresh token');
            }
          } else {
            throw new Error('Failed to fetch saved recipes');
          }
        }

        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        setError(error.message);
      }
    };

    if (user) {
      fetchSavedRecipes();
    }
  }, [user]);

  const handleDelete = async (id) => {
    try {
      let response = await fetch(`/api/recipes/saved-recipes/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${access}`
        }
      });

      if (!response.ok && response.status === 401 && refresh) {
        // Try to refresh the token
        const refreshResponse = await fetch('http://localhost:8000/api/users/token/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });
        
        if (refreshResponse.ok) {
          const tokens = await refreshResponse.json();
          login(tokens.access, refresh);
          
          // Retry the delete with new token
          response = await fetch(`/api/recipes/saved-recipes/${id}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${tokens.access}`
            }
          });
        }
      }

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      setRecipes(recipes.filter(recipe => recipe.id !== id));
    } catch (error) {
      setError(error.message);
    }
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
      <h2 className="mb-4">Saved Recipes</h2>
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {recipes.length === 0 ? (
        <Alert variant="info">
          You haven't saved any recipes yet.
        </Alert>
      ) : (
        recipes.map(savedRecipe => (
          <Card key={savedRecipe.id} className="mb-4">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span>{savedRecipe.recipe.title}</span>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleDelete(savedRecipe.id)}
                >
                  Remove
                </Button>
              </Card.Title>
              <Row>
                <Col md={6}>
                  <h5>Original Recipe</h5>
                  <Table bordered size="sm">
                    <tbody>
                      <tr>
                        <th>Ingredients</th>
                        <td><pre>{savedRecipe.recipe.ingredients}</pre></td>
                      </tr>
                      <tr>
                        <th>Instructions</th>
                        <td><pre>{savedRecipe.recipe.instructions}</pre></td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Healthy Version</h5>
                  <Table bordered size="sm">
                    <tbody>
                      <tr>
                        <th>Ingredients</th>
                        <td><pre>{savedRecipe.recipe.converted_ingredients}</pre></td>
                      </tr>
                      <tr>
                        <th>Instructions</th>
                        <td><pre>{savedRecipe.recipe.converted_instructions}</pre></td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default SavedRecipes;
