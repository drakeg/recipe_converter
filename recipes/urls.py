from django.urls import path
from .views import (
    RecipeListCreateView, SavedRecipeListView,
    SavedRecipeDeleteView, RecipeDetailView,
    RecipeConvertView, GroceryListView,
    GroceryListDetailView, GroceryItemCreateView,
    GroceryItemUpdateView, GroceryItemDeleteView
)
urlpatterns = [
    path('recipes/', RecipeListCreateView.as_view(), name='recipe-list-create'),
    path('recipes/<int:pk>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('saved-recipes/', SavedRecipeListView.as_view(), name='saved-recipe-list'),
    path('saved-recipes/<int:pk>/', SavedRecipeDeleteView.as_view(), name='saved-recipe-delete'),
    path('convert/', RecipeConvertView.as_view(), name='recipe-convert'),
    
    # Grocery list endpoints
    path('grocery-lists/', GroceryListView.as_view(), name='grocery-list'),
    path('grocery-lists/<int:pk>/', GroceryListDetailView.as_view(), name='grocery-list-detail'),
    path('grocery-lists/<int:list_id>/items/', GroceryItemCreateView.as_view(), name='grocery-item-create'),
    path('grocery-items/<int:pk>/', GroceryItemUpdateView.as_view(), name='grocery-item-update'),
    path('grocery-items/<int:pk>/delete/', GroceryItemDeleteView.as_view(), name='grocery-item-delete'),
]
