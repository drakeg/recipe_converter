import re
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Recipe, SavedRecipe
from ..serializers import RecipeSerializer, SavedRecipeSerializer
from ..permissions import IsPaidUser

class RecipeListCreateView(generics.ListCreateAPIView):
    serializer_class = RecipeSerializer

    def get_queryset(self):
        return Recipe.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Recipe.objects.filter(user=self.request.user)

class SavedRecipeListView(generics.ListCreateAPIView):
    serializer_class = SavedRecipeSerializer
    permission_classes = [IsAuthenticated, IsPaidUser]

    def get_queryset(self):
        return SavedRecipe.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SavedRecipeDeleteView(generics.DestroyAPIView):
    serializer_class = SavedRecipeSerializer
    permission_classes = [IsAuthenticated, IsPaidUser]

    def get_queryset(self):
        return SavedRecipe.objects.filter(user=self.request.user)

class RecipeConvertView(generics.CreateAPIView):
    serializer_class = RecipeSerializer

    def create(self, request, *args, **kwargs):
        recipe_data = request.data
        
        # Parse and convert ingredients
        ingredients = recipe_data.get('ingredients', '').split('\n')
        instructions = recipe_data.get('instructions', '').split('\n')
        
        # Healthy substitutions
        substitutions = {
            'butter': 'olive oil',
            'margarine': 'olive oil',
            'vegetable oil': 'olive oil',
            'canola oil': 'olive oil',
            'white flour': 'whole wheat flour',
            'all-purpose flour': 'whole wheat flour',
            'sugar': 'honey',
            'brown sugar': 'coconut sugar',
            'white rice': 'brown rice',
            'white bread': 'whole grain bread',
            'bread crumbs': 'whole grain bread crumbs',
            'white pasta': 'whole wheat pasta',
            'pasta': 'whole wheat pasta',
            'heavy cream': 'greek yogurt',
            'sour cream': 'greek yogurt',
            'mayonnaise': 'greek yogurt',
            'whole milk': 'almond milk',
            'milk': 'almond milk',
            'cream cheese': 'low-fat cream cheese',
            'ground beef': 'lean ground turkey',
            'beef': 'lean beef',
            'bacon': 'turkey bacon',
            'salt': 'sea salt',
            'chocolate chips': 'dark chocolate chips',
            'white chocolate': 'dark chocolate',
            'rice': 'quinoa',
            'breadcrumbs': 'ground oats',
            'corn syrup': 'maple syrup',
        }

        # Reduce quantities for certain ingredients
        reduce_by_half = ['salt', 'sugar', 'honey', 'maple syrup', 'coconut sugar', 'olive oil']
        
        converted_ingredients = []
        for ingredient in ingredients:
            if not ingredient.strip():
                continue
                
            from ..utils.ingredient_parser import parseIngredient
            parsed = parseIngredient(ingredient)
            
            # Check for substitutions
            ingredient_name = parsed['ingredient'].lower()
            for unhealthy, healthy in substitutions.items():
                if unhealthy in ingredient_name:
                    parsed['ingredient'] = parsed['ingredient'].replace(unhealthy, healthy)
                    break
            
            # Reduce quantities for certain ingredients
            if parsed['quantity'] and any(item in ingredient_name for item in reduce_by_half):
                parsed['quantity'] = parsed['quantity'] / 2
            
            # Format the converted ingredient
            if parsed['quantity'] and parsed['unit']:
                converted_ingredients.append(f"{parsed['quantity']} {parsed['unit']} {parsed['ingredient']}")
            elif parsed['quantity']:
                converted_ingredients.append(f"{parsed['quantity']} {parsed['ingredient']}")
            else:
                converted_ingredients.append(parsed['ingredient'])
        
        converted_ingredients = '\n'.join(converted_ingredients)
        
        # Update instructions with substitutions
        converted_instructions = []
        for instruction in instructions:
            if not instruction.strip():
                continue
                
            instruction_text = instruction
            for unhealthy, healthy in substitutions.items():
                instruction_text = re.sub(
                    fr'\b{re.escape(unhealthy)}\b',
                    healthy,
                    instruction_text,
                    flags=re.IGNORECASE
                )
            converted_instructions.append(instruction_text)
        
        converted_instructions = '\n'.join(converted_instructions)
        
        recipe = Recipe.objects.create(
            user=request.user if request.user.is_authenticated else None,
            title=recipe_data.get('title', 'Untitled Recipe'),
            ingredients=recipe_data.get('ingredients', ''),
            instructions=recipe_data.get('instructions', ''),
            converted_ingredients=converted_ingredients,
            converted_instructions=converted_instructions
        )
        
        serializer = self.get_serializer(recipe)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
