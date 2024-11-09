from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path("", views.login2, name="login2"),
    # path("login", views.login, name="login"),
    path("login2", views.login2, name="login2"),
    path("dashboard", views.dashboard, name="dashboard"),
    path("ticket", views.tables, name="ticket"),
    path("user", views.user, name="user"),
    path("historial", views.historial, name="historial"),
    path("list_tickets", views.list_tickets, name="list_tickets"),

    ]