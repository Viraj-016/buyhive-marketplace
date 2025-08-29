# apps/accounts/views.py

from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from .models import User, UserProfile, Address
from .serializers import UserRegisterSerializer, UserSerializer, AddressSerializer

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View to retrieve or update the profile of the currently authenticated user.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Returns the user object of the currently logged-in user
        return self.request.user

class AddressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the user to manage their addresses.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # This ensures a user can only see and edit their own addresses
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # This automatically assigns the current user to the address being created
        serializer.save(user=self.request.user)
