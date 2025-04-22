import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RecipeInput from './components/RecipeInput';
import RecipeComparison from './components/RecipeComparison';
import SavedRecipes from './components/SavedRecipes';
import GroceryList from './components/GroceryList';
import MealPlanner from './components/MealPlanner';
import AppNavbar from './components/Navbar';
import { AuthProvider } from './components/AuthContext';
import { RecipeProvider, useRecipe } from './components/RecipeContext';

const Layout = ({ children }) => (
  <>
    <AppNavbar />
    <Container className="py-4">
      {children}
    </Container>
  </>
);

function App() {
  const HomePage = () => {
    const { loading, error } = useRecipe();
    return (
      <Layout>
        <RecipeInput />
        {loading && <div className="alert alert-info">Converting...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <RecipeComparison />
      </Layout>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <HomePage />
      )
    },
    {
      path: "/saved-recipes",
      element: (
        <Layout>
          <SavedRecipes />
        </Layout>
      )
    },
    {
      path: "/grocery-list",
      element: (
        <Layout>
          <GroceryList />
        </Layout>
      )
    },
    {
      path: "/meal-planner",
      element: (
        <Layout>
          <MealPlanner />
        </Layout>
      )
    }
  ]);

  return (
    <AuthProvider>
      <RecipeProvider>
        <RouterProvider router={router} />
      </RecipeProvider>
    </AuthProvider>

  );
}

export default App;
