import React, { useContext, useState } from 'react';
import { Card, Row, Col, Table, Button, Alert } from 'react-bootstrap';
import { AuthContext } from './AuthContext';
import { useRecipe } from './RecipeContext';

const RecipeComparison = () => {
  const { original, converted } = useRecipe();
  const { user, access, refresh, login } = useContext(AuthContext);
  const [saveStatus, setSaveStatus] = useState(null);
  
  const handleSave = async () => {
    if (!user) {
      setSaveStatus({ type: 'danger', message: 'Please log in to save recipes' });
      return;
    }

    if (!user.paid_subscription) {
      setSaveStatus({ type: 'danger', message: 'Paid subscription required to save recipes' });
      return;
    }

    try {
      const response = await fetch('/api/recipes/recipes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        body: JSON.stringify({
          title: original.title || 'Untitled Recipe',
          ingredients: original.ingredients,
          instructions: original.instructions,
          converted_ingredients: converted.ingredients,
          converted_instructions: converted.instructions
        })
      });

      if (!response.ok) {
        if (response.status === 401 && refresh) {
          // Try to refresh the token
          const refreshResponse = await fetch('/api/users/token/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
          });
          
          if (refreshResponse.ok) {
            const tokens = await refreshResponse.json();
            login(tokens.access, refresh);
            
            // Retry the save with new token
            const retryResponse = await fetch('/api/recipes/recipes/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.access}`
              },
              body: JSON.stringify({
                title: original.title || 'Untitled Recipe',
                ingredients: original.ingredients,
                instructions: original.instructions,
                converted_ingredients: converted.ingredients,
                converted_instructions: converted.instructions
              })
            });
            
            if (!retryResponse.ok) {
              throw new Error('Failed to save recipe after token refresh');
            }
            return await retryResponse.json();
          }
        }
        
        let error;
        try {
          error = await response.json();
        } catch {
          error = { detail: 'Network error occurred' };
        }
        throw new Error(error.detail || 'Failed to save recipe');
      }

      const savedRecipe = await response.json();
      
      // Now save to saved_recipes
      const saveResponse = await fetch('/api/recipes/saved-recipes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        body: JSON.stringify({
          recipe_id: savedRecipe.id
        })
      });

      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        throw new Error(error.detail || 'Failed to save to favorites');
      }

      setSaveStatus({ type: 'success', message: 'Recipe saved successfully!' });
    } catch (error) {
      setSaveStatus({ type: 'danger', message: error.message });
    }
  };

  if (!original || !converted) return null;

  return (
    <Card className="mb-4">
      <Card.Header>
        <h4>{original.title || 'Untitled Recipe'}</h4>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <h5>Original Recipe</h5>
            <Table bordered size="sm">
              <tbody>
                <tr>
                  <th>Ingredients</th>
                  <td><pre>{original.ingredients}</pre></td>
                </tr>
                <tr>
                  <th>Instructions</th>
                  <td><pre>{original.instructions}</pre></td>
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
                  <td><pre>{converted.ingredients}</pre></td>
                </tr>
                <tr>
                  <th>Instructions</th>
                  <td><pre>{converted.instructions}</pre></td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <div className="mt-3 text-end">
          {saveStatus && (
            <Alert variant={saveStatus.type} onClose={() => setSaveStatus(null)} dismissible>
              {saveStatus.message}
            </Alert>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!user || !user.paid_subscription}
          >
            {!user ? 'Please Log In to Save' : 
             !user.paid_subscription ? 'Save Recipe (Requires Paid Subscription)' : 
             'Save Recipe'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RecipeComparison;
