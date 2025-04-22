from datetime import datetime, timedelta
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import MealPlan, MealPlanItem
from ..serializers import MealPlanSerializer, MealPlanItemSerializer
from ..permissions import IsPaidUser

class MealPlanListCreateView(generics.ListCreateAPIView):
    serializer_class = MealPlanSerializer
    permission_classes = [IsAuthenticated, IsPaidUser]

    def get_queryset(self):
        week_start = self.request.query_params.get('week_start')
        if week_start:
            try:
                week_start = datetime.strptime(week_start, '%Y-%m-%d').date()
            except ValueError:
                week_start = datetime.now().date()
        else:
            week_start = datetime.now().date()

        # Get the start of the week (Sunday)
        week_start = week_start - timedelta(days=week_start.weekday() + 1)
        
        return MealPlan.objects.filter(
            user=self.request.user,
            week_start=week_start
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MealPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MealPlanSerializer
    permission_classes = [IsAuthenticated, IsPaidUser]

    def get_queryset(self):
        return MealPlan.objects.filter(user=self.request.user)

class MealPlanItemCreateView(generics.CreateAPIView):
    serializer_class = MealPlanItemSerializer
    permission_classes = [IsAuthenticated, IsPaidUser]

    def perform_create(self, serializer):
        meal_plan = MealPlan.objects.get(
            id=self.kwargs['meal_plan_id'],
            user=self.request.user
        )
        serializer.save(meal_plan=meal_plan)

class MealPlanItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MealPlanItemSerializer
    permission_classes = [IsAuthenticated, IsPaidUser]

    def get_queryset(self):
        return MealPlanItem.objects.filter(meal_plan__user=self.request.user)
