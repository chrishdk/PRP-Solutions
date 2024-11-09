from django.shortcuts import render
from django.http.response import JsonResponse
from .models import Ticket

# Create your views here.


# def login(request):
#     return render(request,'login.html')

def login2(request):
    return render(request,'login2.html')
def historial(request):
    return render(request,'historial.html')

def dashboard(request):
    return render(request,'index.html')

def tables(request):
    return render(request,'tables.html')

def user(request):
    return render(request,'ticket_user.html')

def list_tickets(_request):
    tickets=list(Ticket.objects.values())
    data={'tickets': tickets}
    return JsonResponse(data)
