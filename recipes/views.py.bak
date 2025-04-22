from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.exceptions import PermissionDenied
from .models import Recipe, SavedRecipe, GroceryList, GroceryItem
from .serializers import (
    RecipeSerializer, SavedRecipeSerializer,
    GroceryListSerializer, GroceryListCreateSerializer,
    GroceryItemSerializer
)
from users.models import Profile
from typing import Any

# Basic substitution logic for MVP
SUBSTITUTIONS = [
    (r"\bwhole milk\b", "skim milk"),
    (r"\bheavy cream\b", "coconut cream"),
    (r"\bbutter\b", "olive oil"),
    (r"\bsugar\b", "stevia"),
    (r"\bwhite flour\b", "whole wheat flour"),
    (r"\bvegetable oil\b", "avocado oil"),
]

class RecipeListCreateView(generics.ListCreateAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SavedRecipeListView(generics.ListCreateAPIView):
    serializer_class = SavedRecipeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedRecipe.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Check if user has a paid subscription
        try:
            profile = Profile.objects.get(user=self.request.user)
            if not profile.paid_subscription:
                raise PermissionDenied("Saving recipes requires a paid subscription.")
        except Profile.DoesNotExist:
            raise PermissionDenied("User profile not found.")

        # Get the recipe to save
        recipe_id = self.request.data.get('recipe')
        try:
            recipe = Recipe.objects.get(pk=recipe_id)
        except Recipe.DoesNotExist:
            return Response(
                {"error": "Recipe not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if recipe is already saved
        if SavedRecipe.objects.filter(user=self.request.user, recipe=recipe).exists():
            return Response(
                {"error": "Recipe already saved"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save(user=self.request.user, recipe=recipe)

class SavedRecipeDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedRecipeSerializer

    def get_queryset(self):
        return SavedRecipe.objects.filter(user=self.request.user)

class RecipeDetailView(generics.RetrieveAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [AllowAny]

class RecipeConvertView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Any) -> Response:
        ingredients = request.data.get("ingredients", "")
        instructions = request.data.get("instructions", "")
        converted_ingredients = ingredients
        converted_instructions = instructions
        import re
        for pattern, replacement in SUBSTITUTIONS:
            converted_ingredients = re.sub(pattern, replacement, converted_ingredients, flags=re.IGNORECASE)
            converted_instructions = re.sub(pattern, replacement, converted_instructions, flags=re.IGNORECASE)
        return Response({
            "converted_ingredients": converted_ingredients,
            "converted_instructions": converted_instructions
        }, status=status.HTTP_200_OK)

class GroceryListView(generics.ListCreateAPIView):
    serializer_class = GroceryListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GroceryList.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GroceryListCreateSerializer
        return GroceryListSerializer

    def perform_create(self, serializer):
        # Check if user has a paid subscription
        try:
            profile = Profile.objects.get(user=self.request.user)
            if not profile.paid_subscription:
                raise PermissionDenied("Creating grocery lists requires a paid subscription.")
        except Profile.DoesNotExist:
            raise PermissionDenied("User profile not found.")

        grocery_list = serializer.save(user=self.request.user)

        # Parse ingredients from recipes and create grocery items
        from .utils.ingredient_parser import parseIngredient, categorizeIngredient, combineIngredients

        all_ingredients = []
        for recipe in grocery_list.recipes.all():
            ingredients = recipe.converted_ingredients.split('\n')
            for ingredient in ingredients:
                if ingredient.strip():
                    parsed = parseIngredient(ingredient)
                    if parsed['ingredient']:
                        all_ingredients.append(parsed)

        # Combine similar ingredients
        combined = combineIngredients(all_ingredients)

        # Create grocery items
        items_to_create = [
            GroceryItem(
                grocery_list=grocery_list,
                ingredient=item['ingredient'],
                quantity=item['displayQuantity'],
                unit=item['unit'],
                category=item['category']
            ) for item in combined
        ]
        GroceryItem.objects.bulk_create(items_to_create)

class GroceryListDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = GroceryListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GroceryList.objects.filter(user=self.request.user)

class GroceryItemCreateView(generics.CreateAPIView):
    serializer_class = GroceryItemSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        grocery_list = GroceryList.objects.get(
            pk=self.kwargs['list_id'],
            user=self.request.user
        )
        parsed = parseIngredient(serializer.validated_data['ingredient'])
        serializer.save(
            grocery_list=grocery_list,
            ingredient=parsed['ingredient'],
            quantity=parsed['quantity'],
            unit=parsed['unit'],
            category=categorizeIngredient(parsed['ingredient']),
            custom=True
        )

class GroceryItemUpdateView(generics.UpdateAPIView):
    serializer_class = GroceryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GroceryItem.objects.filter(
            grocery_list__user=self.request.user
        )

class GroceryItemDeleteView(generics.DestroyAPIView):
    serializer_class = GroceryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GroceryItem.objects.filter(
            grocery_list__user=self.request.user
        )
