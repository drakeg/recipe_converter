import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { AuthContext } from './AuthContext';
import { BsCalendar3, BsPlus, BsTrash } from 'react-icons/bs';

const MealPlanner = () => {
  const { user, access } = useContext(AuthContext);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(getStartOfWeek());

  // Get start of current week (Sunday)
  function getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  // Format date for display
  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get dates for the week
  function getWeekDates(startDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  // Get meal types
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  // Fetch saved recipes
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const response = await fetch('/api/recipes/saved-recipes/', {
          headers: {
            'Authorization': `Bearer ${access}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSavedRecipes(data);
        }
      } catch (err) {
        setError('Failed to fetch saved recipes');
      }
    };

    if (access) {
      fetchSavedRecipes();
    }
  }, [access]);

  // Fetch meal plan for selected week
  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const response = await fetch(`/api/recipes/meal-plan/?week=${selectedWeek.toISOString()}`, {
          headers: {
            'Authorization': `Bearer ${access}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMealPlan(data);
        }
      } catch (err) {
        setError('Failed to fetch meal plan');
      }
    };

    if (access) {
      fetchMealPlan();
    }
  }, [access, selectedWeek]);

  const handleAddMeal = async (date, mealType, recipeId) => {
    try {
      const response = await fetch('/api/recipes/meal-plan/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date,
          meal_type: mealType,
          recipe_id: recipeId
        })
      });

      if (response.ok) {
        const updatedPlan = { ...mealPlan };
        const dateKey = date.toISOString().split('T')[0];
        if (!updatedPlan[dateKey]) {
          updatedPlan[dateKey] = {};
        }
        if (!updatedPlan[dateKey][mealType]) {
          updatedPlan[dateKey][mealType] = [];
        }
        updatedPlan[dateKey][mealType].push(
          savedRecipes.find(r => r.id === recipeId)
        );
        setMealPlan(updatedPlan);
      }
    } catch (err) {
      setError('Failed to add meal to plan');
    }
  };

  const handleRemoveMeal = async (date, mealType, recipeId) => {
    try {
      const response = await fetch(`/api/recipes/meal-plan/${recipeId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${access}`
        }
      });

      if (response.ok) {
        const updatedPlan = { ...mealPlan };
        const dateKey = date.toISOString().split('T')[0];
        updatedPlan[dateKey][mealType] = updatedPlan[dateKey][mealType]
          .filter(meal => meal.id !== recipeId);
        setMealPlan(updatedPlan);
      }
    } catch (err) {
      setError('Failed to remove meal from plan');
    }
  };

  if (!user?.paid_subscription) {
    return (
      <Container>
        <Alert variant="info">
          This feature is only available to paid subscribers.
          Please upgrade your account to access the meal planner.
        </Alert>
      </Container>
    );
  }

  const weekDates = getWeekDates(selectedWeek);

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>
            <BsCalendar3 className="me-2" />
            Meal Planner
          </h2>
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-primary"
            onClick={() => {
              const newDate = new Date(selectedWeek);
              newDate.setDate(newDate.getDate() - 7);
              setSelectedWeek(newDate);
            }}
          >
            Previous Week
          </Button>
          <Button
            variant="outline-primary"
            className="ms-2"
            onClick={() => {
              const newDate = new Date(selectedWeek);
              newDate.setDate(newDate.getDate() + 7);
              setSelectedWeek(newDate);
            }}
          >
            Next Week
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Row>
        {weekDates.map(date => (
          <Col key={date.toISOString()} md={12} lg className="mb-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">{formatDate(date)}</h5>
              </Card.Header>
              <Card.Body>
                {mealTypes.map(mealType => {
                  const dateKey = date.toISOString().split('T')[0];
                  const meals = mealPlan[dateKey]?.[mealType] || [];

                  return (
                    <div key={mealType} className="mb-4">
                      <h6>
                        {mealType}
                        <Badge bg="secondary" className="ms-2">
                          {meals.length}
                        </Badge>
                      </h6>
                      {meals.map(meal => (
                        <Card key={meal.id} className="mb-2">
                          <Card.Body className="py-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{meal.recipe.title}</span>
                              <Button
                                variant="link"
                                className="text-danger p-0"
                                onClick={() => handleRemoveMeal(date, mealType, meal.id)}
                              >
                                <BsTrash />
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                      <Form.Select
                        size="sm"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddMeal(date, mealType, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Add meal...</option>
                        {savedRecipes.map(recipe => (
                          <option key={recipe.id} value={recipe.id}>
                            {recipe.recipe.title}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MealPlanner;
