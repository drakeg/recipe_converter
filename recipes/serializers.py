from rest_framework import serializers
from .models import Recipe, SavedRecipe, GroceryList, GroceryItem
from users.serializers import UserSerializer

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = [
            'id',
            'user',
            'title',
            'ingredients',
            'instructions',
            'converted_ingredients',
            'converted_instructions',
            'created_at',
            'updated_at',
        ]

class SavedRecipeSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = SavedRecipe
        fields = ['id', 'user', 'recipe', 'created_at', 'updated_at']
        read_only_fields = ['user']

class GroceryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroceryItem
        fields = [
            'id',
            'grocery_list',
            'ingredient',
            'quantity',
            'unit',
            'category',
            'checked',
            'custom',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['grocery_list']

class GroceryListSerializer(serializers.ModelSerializer):
    items = GroceryItemSerializer(many=True, read_only=True)
    recipes = RecipeSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = GroceryList
        fields = [
            'id',
            'user',
            'name',
            'recipes',
            'items',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user']

class GroceryListCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a grocery list with recipe IDs"""
    recipe_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = GroceryList
        fields = ['name', 'recipe_ids']

    def create(self, validated_data):
        recipe_ids = validated_data.pop('recipe_ids', [])
        grocery_list = GroceryList.objects.create(**validated_data)
        
        if recipe_ids:
            recipes = Recipe.objects.filter(id__in=recipe_ids)
            grocery_list.recipes.set(recipes)
        
        return grocery_list
