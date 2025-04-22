from rest_framework import permissions

class IsPaidUser(permissions.BasePermission):
    """
    Custom permission to only allow paid users to access certain features.
    """
    def has_permission(self, request, view):
        # Check if user is authenticated and has paid subscription
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.paid_subscription
        )
