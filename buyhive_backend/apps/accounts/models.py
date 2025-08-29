# apps/accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.core.validators import EmailValidator  

# --- UserManager ---
class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""
    
    use_in_migrations = True  
    
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')
        
        email = self.normalize_email(email).strip().lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
        
    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)
        
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
            
        return self._create_user(email, password, **extra_fields)

# --- User Model ---
class User(AbstractUser):
    username = None
    email = models.EmailField(
        _('email address'), 
        unique=True,
        validators=[EmailValidator()],  
        help_text=_('Required. Used as the login identifier.')  
    )
    is_vendor = models.BooleanField(
        default=False, 
        help_text='Designates whether the user can log in as a vendor.'
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    class Meta:  
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
        
    def clean(self):  
        super().clean()
        if self.email:
            self.email = self.email.strip().lower()

# --- UserProfile Model ---
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:  
        verbose_name = _('user profile')
        verbose_name_plural = _('user profiles')
    
    def __str__(self):
        return f"{self.user.email}'s Profile"

# --- Address Model ---
class Address(models.Model):
    ADDRESS_TYPE_CHOICES = (
        ('billing', 'Billing'),
        ('shipping', 'Shipping'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street_address = models.CharField(max_length=255)
    apartment_address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPE_CHOICES)
    is_default = models.BooleanField(default=False)
    
    class Meta:
        verbose_name_plural = "Addresses"
        indexes = [
            models.Index(fields=['user', 'address_type', 'is_default']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.get_address_type_display()} Address"
        
    def save(self, *args, **kwargs): 
        """Ensure only one default address per user per type"""
        if self.is_default and self.user_id:
            Address.objects.filter(
                user_id=self.user_id,
                address_type=self.address_type,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
