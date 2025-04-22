from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import GroceryList, GroceryItem, Recipe
from ..serializers import (
    GroceryListSerializer,
    GroceryListCreateSerializer,
    GroceryItemSerializer
)
from ..permissions import IsPaidUser

class GroceryListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsPaidUser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GroceryListCreateSerializer
        return GroceryListSerializer

    def get_queryset(self):
        return GroceryList.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GroceryListDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GroceryListSerializer
    permission_classes = [IsAuthenticated, IsPaidUser]

    def get_queryset(self):
        return GroceryList.objects.filter(user=self.request.user)

class GroceryItemCreateView(generics.CreateAPIView):
    serializer_class = GroceryItemSerializer
    permission_classes = [IsAuthenticated, IsPaidUser]

    def perform_create(self, serializer):
        grocery_list = GroceryList.objects.get(
            id=self.kwargs['list_id'],
            user=self.request.user
        )
        serializer.save(grocery_list=grocery_list)

class GroceryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GroceryItemSerializer
    permission_classes = [IsAuthenticated, IsPaidUser]

    def get_queryset(self):
        return GroceryItem.objects.filter(grocery_list__user=self.request.user)
