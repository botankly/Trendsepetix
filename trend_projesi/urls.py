from django.contrib import admin
from django.urls import path
from myapp import views  # Bizim yazdığımız kodları buraya çağırıyoruz

urlpatterns = [
    path('admin/', admin.site.urls),  # Yönetim paneli yolu
    path('', views.index, name='index'),  # Ana sayfa (artık vitrin görünecek)
]