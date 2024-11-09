# middleware.py

from django.shortcuts import redirect,render
from django.conf import settings

# class RoleBasedAccessMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         # Ruta de inicio de sesión
#         login_route = '/login2'  # Cambia esto por la ruta de tu inicio de sesión

#         # Definir rutas protegidas y los roles que pueden acceder
#         protected_routes = {
#             '/ticket': ['admin'],          # Solo admin puede acceder a la raíz
#             '/user': ['user'],      # Solo user puede acceder a '/user'
#             # Agrega más rutas según tus necesidades
#         }

#         # Verifica si la ruta es la de inicio de sesión
#         if request.path != login_route:
#             # Obtener el rol del usuario desde la cookie
#             role = request.COOKIES.get('userRole')
#             print(f"User role from cookie: {role}")  # Mensaje de depuración

#             # Si no hay rol, redirigir a login
#             if not role:
#                 print("No role found, redirecting to login.")
#                 return redirect(settings.LOGIN_URL)

#             # Verificar si la ruta está protegida
#             for route, roles in protected_routes.items():
#                 if request.path.startswith(route):
#                     print(f"Checking access for route: {request.path} with roles: {roles}")  # Mensaje de depuración
#                     # Comprobar si el rol del usuario está permitido para la ruta
#                     if role not in roles:
#                         print("Role not allowed, redirecting to login.")
#                         return redirect(settings.LOGIN_URL)  # Redirigir a la página de inicio de sesión

#         response = self.get_response(request)
#         return response


# middleware.py



class RoleBasedAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        login_route = '/login2'
        protected_routes = {
            '/ticket': ['admin'],
            '/dashboard': ['admin'],
            '/user': ['user'],
        }

        # Verifica si la ruta es la de inicio de sesión
        if request.path != login_route:
            role = request.COOKIES.get('userRole')

            # Si no hay rol, redirigir a la página de inicio de sesión
            if not role:
                return redirect(settings.LOGIN_URL)

            # Verificar si la ruta está protegida
            for route, roles in protected_routes.items():
                if request.path.startswith(route):
                    # Si el rol no está permitido, renderizar la página de acceso denegado
                    if role not in roles:
                        return render(request, '403.html')  # Renderizar página de acceso denegado

        response = self.get_response(request)
        return response