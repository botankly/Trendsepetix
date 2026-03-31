from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    stock = models.IntegerField(default=10)
    # Yeni: Ürün görseli için URL alanı
    image_url = models.CharField(max_length=500, default="https://via.placeholder.com/150")

    def __str__(self): return self.name

class Sale(models.Model):
    products = models.ManyToManyField(Product)
    district = models.CharField(max_length=100)
    shop_name = models.CharField(max_length=100)
    lat = models.FloatField(default=41.0082)
    lng = models.FloatField(default=28.9784)
    recommendation = models.CharField(max_length=255, blank=True)

    def __str__(self): return f"{self.shop_name} - {self.district}"