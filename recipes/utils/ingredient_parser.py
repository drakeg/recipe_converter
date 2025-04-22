from typing import Dict, Any, List

# Common units of measurement
units = [
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
]

# Categories and their associated ingredients
categories = {
    'produce': [
        'apple', 'banana', 'orange', 'lettuce', 'tomato', 'onion', 'garlic',
        'carrot', 'potato', 'celery', 'cucumber', 'pepper', 'lemon', 'lime',
        'spinach', 'kale', 'broccoli', 'cauliflower', 'mushroom', 'zucchini',
        'squash', 'pumpkin', 'ginger', 'herbs', 'parsley', 'cilantro', 'basil',
        'mint', 'thyme', 'rosemary', 'sage'
    ],
    'dairy': [
        'milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese',
        'cream cheese', 'mozzarella', 'cheddar', 'parmesan', 'ricotta', 'buttermilk',
        'half and half', 'whipping cream', 'heavy cream'
    ],
    'meat': [
        'chicken', 'beef', 'pork', 'turkey', 'lamb', 'fish', 'salmon', 'tuna',
        'shrimp', 'bacon', 'sausage', 'ground beef', 'ground turkey', 'ham',
        'steak', 'ribs', 'duck', 'veal'
    ],
    'pantry': [
        'flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'rice', 'pasta',
        'bread', 'cereal', 'baking powder', 'baking soda', 'vanilla', 'cinnamon',
        'oregano', 'cumin', 'paprika', 'nutmeg', 'honey', 'maple syrup',
        'soy sauce', 'ketchup', 'mustard', 'mayonnaise'
    ],
    'frozen': [
        'ice cream', 'frozen vegetables', 'frozen fruit', 'frozen pizza',
        'frozen dinner', 'ice', 'frozen peas', 'frozen corn', 'frozen berries'
    ],
    'beverages': [
        'water', 'coffee', 'tea', 'juice', 'soda', 'wine', 'beer',
        'sparkling water', 'coconut water', 'almond milk', 'soy milk'
    ],
    'other': []
}

# Regular expressions for parsing
import re
number_pattern = re.compile(r'(\d+\/\d+|\d*\.?\d+)\s*')
unit_pattern = re.compile(fr'\b({"|".join(units)})\b', re.IGNORECASE)

def parseIngredient(ingredientText: str) -> Dict[str, Any]:
    """Parse an ingredient string into quantity, unit, and ingredient name."""
    ingredientText = ingredientText.lower().strip()
    
    # Remove common prefixes and parenthetical notes
    ingredientText = re.sub(r'^[-•*]\s*', '', ingredientText)
    ingredientText = re.sub(r'\(.*?\)', '', ingredientText)
    ingredientText = ingredientText.strip()

    quantity = None
    unit = None
    ingredient = ingredientText

    # Extract quantity
    quantity_match = number_pattern.match(ingredient)
    if quantity_match:
        quantity = quantity_match.group(0).strip()
        ingredient = ingredient[quantity_match.end():].strip()

    # Extract unit
    unit_match = unit_pattern.match(ingredient)
    if unit_match:
        unit = unit_match.group(0).lower()
        ingredient = ingredient[unit_match.end():].strip()

    # Clean up ingredient name
    ingredient = re.sub(r',', '', ingredient)
    ingredient = re.sub(r'\s+', ' ', ingredient)
    ingredient = ingredient.strip()

    return {
        'quantity': quantity,
        'unit': unit,
        'ingredient': ingredient
    }

def categorizeIngredient(ingredient: str) -> str:
    """Categorize an ingredient into one of the predefined categories."""
    ingredient = ingredient.lower()
    
    for category, items in categories.items():
        if any(
            item in ingredient or ingredient in item
            for item in items
        ):
            return category
    
    return 'other'

def combineIngredients(ingredients: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Combine similar ingredients and their quantities."""
    combined = {}

    for item in ingredients:
        key = f"{item['ingredient']}|{item['unit'] or ''}"
        
        if key not in combined:
            combined[key] = {
                'quantities': [],
                'unit': item['unit'],
                'ingredient': item['ingredient'],
                'category': categorizeIngredient(item['ingredient'])
            }
        
        if item['quantity']:
            combined[key]['quantities'].append(item['quantity'])

    return [
        {
            **item,
            'displayQuantity': ' + '.join(item['quantities']) if item['quantities'] else None
        }
        for item in combined.values()
    ]
