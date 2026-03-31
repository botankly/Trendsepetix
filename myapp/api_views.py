from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Sale
from .serializers import ProductSerializer, SaleSerializer
from .utils.analysis import get_associations

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().prefetch_related('products')
    serializer_class = SaleSerializer

    @action(detail=False, methods=['get'])
    def analyze(self, request):
        sales = self.get_queryset()
        analysis_results = get_associations(sales)
        return Response(analysis_results)
