from rest_framework import viewsets
from .models import Product, Sale
from .serializers import ProductSerializer, SaleSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().prefetch_related('products')
    serializer_class = SaleSerializer
