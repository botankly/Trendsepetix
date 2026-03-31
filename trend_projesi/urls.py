from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from myapp import views, api_views

router = DefaultRouter()
router.register(r'products', api_views.ProductViewSet)
router.register(r'sales', api_views.SaleViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('api/', include(router.urls)),
]