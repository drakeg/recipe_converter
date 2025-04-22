from django.db import models
from django.conf import settings
from typing import Optional, Dict, Any, List

class Recipe(models.Model):
    user: Optional[settings.AUTH_USER_MODEL] = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )  # Null/blank for anonymous users
    title: str = models.CharField(max_length=255)
    ingredients: str = models.TextField()
    instructions: str = models.TextField()
    converted_ingredients: str = models.TextField(blank=True)
    converted_instructions: str = models.TextField(blank=True)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title

class SavedRecipe(models.Model):
    user: settings.AUTH_USER_MODEL = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    recipe: Recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE
    )
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        unique_together = ['user', 'recipe']
        verbose_name = 'Saved Recipe'
        verbose_name_plural = 'Saved Recipes'

    def __str__(self) -> str:
        return f"{self.user.username}'s saved recipe: {self.recipe.title}"

class GroceryList(models.Model):
    CATEGORY_CHOICES = [
        ('produce', 'Produce'),
        ('dairy', 'Dairy'),
        ('meat', 'Meat'),
        ('pantry', 'Pantry'),
        ('frozen', 'Frozen'),
        ('beverages', 'Beverages'),
        ('other', 'Other'),
    ]

    user: settings.AUTH_USER_MODEL = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    name: str = models.CharField(max_length=255)
    recipes: List[Recipe] = models.ManyToManyField(Recipe, blank=True)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Grocery List'
        verbose_name_plural = 'Grocery Lists'

    def __str__(self) -> str:
        return f"{self.user.username}'s list: {self.name}"

class GroceryItem(models.Model):
    grocery_list: GroceryList = models.ForeignKey(
        GroceryList,
        on_delete=models.CASCADE,
        related_name='items'
    )
    ingredient: str = models.CharField(max_length=255)
    quantity: Optional[str] = models.CharField(max_length=50, null=True, blank=True)
    unit: Optional[str] = models.CharField(max_length=50, null=True, blank=True)
    category: str = models.CharField(
        max_length=20,
        choices=GroceryList.CATEGORY_CHOICES,
        default='other'
    )
    checked: bool = models.BooleanField(default=False)
    custom: bool = models.BooleanField(default=False)  # True for manually added items
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'ingredient']
        verbose_name = 'Grocery Item'
        verbose_name_plural = 'Grocery Items'

    def __str__(self) -> str:
        parts = []
        if self.quantity:
            parts.append(self.quantity)
        if self.unit:
            parts.append(self.unit)
        parts.append(self.ingredient)
        return ' '.join(parts)

class MealPlan(models.Model):
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]

    user: settings.AUTH_USER_MODEL = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    week_start: models.DateField = models.DateField()
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-week_start']
        verbose_name = 'Meal Plan'
        verbose_name_plural = 'Meal Plans'
        unique_together = ['user', 'week_start']

    def __str__(self) -> str:
        return f"{self.user.username}'s meal plan for week of {self.week_start}"

class MealPlanItem(models.Model):
    meal_plan: MealPlan = models.ForeignKey(
        MealPlan,
        on_delete=models.CASCADE,
        related_name='items'
    )
    recipe: Recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE
    )
    date: models.DateField = models.DateField()
    meal_type: str = models.CharField(
        max_length=20,
        choices=MealPlan.MEAL_TYPE_CHOICES
    )
    notes: Optional[str] = models.TextField(blank=True, null=True)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'meal_type']
        verbose_name = 'Meal Plan Item'
        verbose_name_plural = 'Meal Plan Items'

    def __str__(self) -> str:
        return f"{self.recipe.title} for {self.meal_type} on {self.date}"
