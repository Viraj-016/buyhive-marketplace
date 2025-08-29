from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password  
from .models import User, UserProfile, Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ('user',)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('profile_picture', 'phone_number', 'bio')

# apps/accounts/serializers.py - Update UserSerializer
class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_vendor', 'profile')
        read_only_fields = ('is_vendor',)
    
    def update(self, instance, validated_data):
        # Handle nested profile data
        profile_data = validated_data.pop('profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create profile
        if profile_data:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        validators=[validate_password]  # [UPDATED] Added Django's password validation
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True, 
        label="Confirm Password",
        style={'input_type': 'password'}  # [UPDATED] Added style for consistency
    )
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password2')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        # [UPDATED] Removed password2 from validated_data before creating user
        validated_data.pop('password2', None)
        
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']  # [UPDATED] Pass password directly to create_user
        )
        
        # Create a UserProfile instance for the new user
        UserProfile.objects.create(user=user)
        return user
