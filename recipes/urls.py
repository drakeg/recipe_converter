from django.urls import path
from .views import (
    RecipeListCreateView, SavedRecipeListView,
    SavedRecipeDeleteView, RecipeDetailView,
    RecipeConvertView
)
from .views import grocery, meal_plan
urlpatterns = [
    path('recipes/', RecipeListCreateView.as_view(), name='recipe-list-create'),
    path('recipes/<int:pk>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('saved-recipes/', SavedRecipeListView.as_view(), name='saved-recipe-list'),
    path('saved-recipes/<int:pk>/', SavedRecipeDeleteView.as_view(), name='saved-recipe-delete'),
    path('convert/', RecipeConvertView.as_view(), name='recipe-convert'),
    
    # Grocery list endpoints
    path('grocery-lists/', grocery.GroceryListView.as_view(), name='grocery-list'),
    path('grocery-lists/<int:pk>/', grocery.GroceryListDetailView.as_view(), name='grocery-list-detail'),
    path('grocery-lists/<int:list_id>/items/', grocery.GroceryItemCreateView.as_view(), name='grocery-item-create'),
    path('grocery-items/<int:pk>/', grocery.GroceryItemDetailView.as_view(), name='grocery-item-detail'),

    # Meal Planner URLs
    path('meal-plans/', meal_plan.MealPlanListCreateView.as_view(), name='meal-plan-list'),
    path('meal-plans/<int:pk>/', meal_plan.MealPlanDetailView.as_view(), name='meal-plan-detail'),
    path('meal-plans/<int:meal_plan_id>/items/', meal_plan.MealPlanItemCreateView.as_view(), name='meal-plan-item-create'),
    path('meal-plan-items/<int:pk>/', meal_plan.MealPlanItemDetailView.as_view(), name='meal-plan-item-detail'),
]
