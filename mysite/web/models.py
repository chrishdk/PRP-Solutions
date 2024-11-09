from django.db import models

# Create your models here.

class Ticket(models.Model):
    name=models.CharField(max_length=50)
    description=models.CharField(max_length=100)
    usuario=models.CharField(max_length=50)
    tipo=models.CharField(max_length=50)
    estado=models.CharField(max_length=50)
    description = models.CharField(max_length=100, default='Descripción no proporcionada')

    class Meta:
        db_table='ticket'



