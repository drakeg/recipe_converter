// Common units of measurement
const units = [
  'cup', 'cups',
  'tablespoon', 'tablespoons', 'tbsp',
  'teaspoon', 'teaspoons', 'tsp',
  'ounce', 'ounces', 'oz',
  'pound', 'pounds', 'lb', 'lbs',
  'gram', 'grams', 'g',
  'kilogram', 'kilograms', 'kg',
  'ml', 'milliliter', 'milliliters',
  'liter', 'liters', 'l',
  'pinch', 'pinches',
  'dash', 'dashes',
  'piece', 'pieces',
  'slice', 'slices',
  'can', 'cans',
  'package', 'packages', 'pkg',
];

// Categories and their associated ingredients
const categories = {
  produce: [
    'apple', 'banana', 'orange', 'lettuce', 'tomato', 'onion', 'garlic',
    'carrot', 'potato', 'celery', 'cucumber', 'pepper', 'lemon', 'lime',
    'spinach', 'kale', 'broccoli', 'cauliflower', 'mushroom', 'zucchini',
    'squash', 'pumpkin', 'ginger', 'herbs', 'parsley', 'cilantro', 'basil',
    'mint', 'thyme', 'rosemary', 'sage'
  ],
  dairy: [
    'milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese',
    'cream cheese', 'mozzarella', 'cheddar', 'parmesan', 'ricotta', 'buttermilk',
    'half and half', 'whipping cream', 'heavy cream'
  ],
  meat: [
    'chicken', 'beef', 'pork', 'turkey', 'lamb', 'fish', 'salmon', 'tuna',
    'shrimp', 'bacon', 'sausage', 'ground beef', 'ground turkey', 'ham',
    'steak', 'ribs', 'duck', 'veal'
  ],
  pantry: [
    'flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'rice', 'pasta',
    'bread', 'cereal', 'baking powder', 'baking soda', 'vanilla', 'cinnamon',
    'oregano', 'cumin', 'paprika', 'nutmeg', 'honey', 'maple syrup',
    'soy sauce', 'ketchup', 'mustard', 'mayonnaise'
  ],
  frozen: [
    'ice cream', 'frozen vegetables', 'frozen fruit', 'frozen pizza',
    'frozen dinner', 'ice', 'frozen peas', 'frozen corn', 'frozen berries'
  ],
  beverages: [
    'water', 'coffee', 'tea', 'juice', 'soda', 'wine', 'beer',
    'sparkling water', 'coconut water', 'almond milk', 'soy milk'
  ],
  other: []
};

// Regular expressions for parsing
const numberPattern = /(\d+\/\d+|\d*\.?\d+)\s*/;
const unitPattern = new RegExp(`\\b(${units.join('|')})\\b`, 'i');

export const parseIngredient = (ingredientText) => {
  ingredientText = ingredientText.toLowerCase().trim();
  
  // Remove common prefixes and parenthetical notes
  ingredientText = ingredientText
    .replace(/^[-•*]\s*/, '')
    .replace(/\(.*?\)/g, '')
    .trim();

  let quantity = null;
  let unit = null;
  let ingredient = ingredientText;

  // Extract quantity
  const quantityMatch = ingredientText.match(numberPattern);
  if (quantityMatch) {
    quantity = quantityMatch[0].trim();
    ingredient = ingredient.replace(quantityMatch[0], '').trim();
  }

  // Extract unit
  const unitMatch = ingredient.match(unitPattern);
  if (unitMatch) {
    unit = unitMatch[0].toLowerCase();
    ingredient = ingredient.replace(unitMatch[0], '').trim();
  }

  // Clean up ingredient name
  ingredient = ingredient
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    quantity,
    unit,
    ingredient
  };
};

export const categorizeIngredient = (ingredient) => {
  ingredient = ingredient.toLowerCase();
  
  for (const [category, items] of Object.entries(categories)) {
    if (items.some(item => 
      ingredient.includes(item) || 
      item.includes(ingredient)
    )) {
      return category;
    }
  }
  
  return 'other';
};

export const combineIngredients = (ingredients) => {
  const combined = new Map();

  ingredients.forEach(({ quantity, unit, ingredient }) => {
    const key = `${ingredient}|${unit || ''}`;
    
    if (!combined.has(key)) {
      combined.set(key, {
        quantities: [],
        unit: unit,
        ingredient: ingredient,
        category: categorizeIngredient(ingredient)
      });
    }
    
    if (quantity) {
      combined.get(key).quantities.push(quantity);
    }
  });

  return Array.from(combined.values()).map(item => ({
    ...item,
    displayQuantity: item.quantities.length > 0 
      ? item.quantities.join(' + ') 
      : null
  }));
};

export const formatIngredient = (item) => {
  const parts = [];
  if (item.displayQuantity) parts.push(item.displayQuantity);
  if (item.unit) parts.push(item.unit);
  parts.push(item.ingredient);
  return parts.join(' ');
};
