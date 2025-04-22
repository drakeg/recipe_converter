import React, { createContext, useState, useContext } from 'react';

const RecipeContext = createContext();

export const RecipeProvider = ({ children }) => {
  const [original, setOriginal] = useState(null);
  const [converted, setConverted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConvert = async ({ title, ingredients, instructions }) => {
    setOriginal({ title, ingredients, instructions });
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/recipes/convert/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, instructions })
      });
      if (!response.ok) throw new Error('Conversion failed.');
      const data = await response.json();
      setConverted({ ingredients: data.converted_ingredients, instructions: data.converted_instructions });
    } catch (err) {
      setError('Failed to convert recipe.');
      setConverted(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecipeContext.Provider value={{
      original,
      converted,
      loading,
      error,
      handleConvert
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipe = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
};
