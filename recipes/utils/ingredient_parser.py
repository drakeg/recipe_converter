from typing import Dict, Any, List
from fractions import Fraction
import re

# Unit conversion ratios
unit_conversions = {
    'volume': {
        'base_unit': 'ml',
        'conversions': {
            'ml': 1,
            'milliliter': 1,
            'milliliters': 1,
            'l': 1000,
            'liter': 1000,
            'liters': 1000,
            'cup': 236.588,
            'cups': 236.588,
            'tablespoon': 14.7868,
            'tablespoons': 14.7868,
            'tbsp': 14.7868,
            'teaspoon': 4.92892,
            'teaspoons': 4.92892,
            'tsp': 4.92892,
        }
    },
    'weight': {
        'base_unit': 'g',
        'conversions': {
            'g': 1,
            'gram': 1,
            'grams': 1,
            'kg': 1000,
            'kilogram': 1000,
            'kilograms': 1000,
            'oz': 28.3495,
            'ounce': 28.3495,
            'ounces': 28.3495,
            'lb': 453.592,
            'pound': 453.592,
            'pounds': 453.592,
        }
    }
}

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

def convert_fraction_to_float(fraction_str: str) -> float:
    """Convert a fraction string to a float."""
    try:
        if '/' in fraction_str:
            return float(Fraction(fraction_str))
        return float(fraction_str)
    except (ValueError, ZeroDivisionError):
        return 0.0

def normalize_unit(quantity: float, unit: str) -> tuple[float, str]:
    """Convert quantity and unit to base unit if possible."""
    unit = unit.lower()
    for unit_type, data in unit_conversions.items():
        if unit in data['conversions']:
            base_quantity = quantity * data['conversions'][unit]
            return base_quantity, data['base_unit']
    return quantity, unit

def combine_quantities(quantities: List[float], unit: str) -> tuple[float, str]:
    """Combine quantities in the same unit."""
    if not quantities:
        return 0.0, unit
    
    # Convert all quantities to base unit
    base_quantities = []
    base_unit = unit
    
    for qty in quantities:
        base_qty, bu = normalize_unit(qty, unit)
        base_quantities.append(base_qty)
        base_unit = bu
    
    total = sum(base_quantities)
    
    # Convert back to most appropriate unit
    for unit_type, data in unit_conversions.items():
        if base_unit == data['base_unit']:
            # Find the largest unit that gives a reasonable number
            for unit_name, conversion in sorted(
                data['conversions'].items(),
                key=lambda x: x[1],
                reverse=True
            ):
                if total >= conversion:
                    return round(total / conversion, 2), unit_name
    
    return round(total, 2), base_unit

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

    # Extract quantity - handle mixed numbers (e.g., "2 1/2")
    parts = ingredient.split()
    quantities = []
    while parts and (parts[0].replace('.', '').isdigit() or '/' in parts[0]):
        qty_str = parts.pop(0)
        if qty_str.replace('.', '').isdigit() and parts and '/' in parts[0]:
            # Handle mixed numbers like "2 1/2"
            whole = float(qty_str)
            fraction = convert_fraction_to_float(parts.pop(0))
            quantities.append(whole + fraction)
        else:
            quantities.append(convert_fraction_to_float(qty_str))
    
    ingredient = ' '.join(parts)

    # Extract unit
    unit_match = unit_pattern.match(ingredient)
    if unit_match:
        unit = unit_match.group(0).lower()
        ingredient = ingredient[unit_match.end():].strip()

    # Clean up ingredient name
    ingredient = re.sub(r',', '', ingredient)
    ingredient = re.sub(r'\s+', ' ', ingredient)
    ingredient = ingredient.strip()

    # Calculate total quantity
    if quantities:
        quantity = sum(quantities)

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
        # Skip empty ingredients
        if not item['ingredient']:
            continue

        # Create a normalized key for similar ingredients
        base_ingredient = item['ingredient'].lower()
        
        # Try to find a match among existing keys
        matched = False
        for existing_key in list(combined.keys()):
            existing_base = combined[existing_key]['ingredient'].lower()
            
            # Check if ingredients are similar
            if (base_ingredient in existing_base or 
                existing_base in base_ingredient or
                any(word in existing_base.split() for word in base_ingredient.split())):
                
                # If units are compatible, combine them
                if item['unit'] == combined[existing_key]['unit']:
                    if item['quantity']:
                        combined[existing_key]['quantities'].append(item['quantity'])
                    matched = True
                    break
        
        if not matched:
            key = f"{item['ingredient']}|{item['unit'] or ''}"
            combined[key] = {
                'quantities': [item['quantity']] if item['quantity'] else [],
                'unit': item['unit'],
                'ingredient': item['ingredient'],
                'category': categorizeIngredient(item['ingredient'])
            }

    # Process combined ingredients
    result = []
    for item in combined.values():
        if item['quantities'] and item['unit']:
            # Try to normalize and combine quantities
            total_qty, normalized_unit = combine_quantities(
                [float(qty) for qty in item['quantities'] if qty],
                item['unit']
            )
            result.append({
                **item,
                'displayQuantity': str(total_qty) if total_qty > 0 else None,
                'unit': normalized_unit
            })
        else:
            result.append({
                **item,
                'displayQuantity': None
            })

    return sorted(result, key=lambda x: (x['category'], x['ingredient']))
