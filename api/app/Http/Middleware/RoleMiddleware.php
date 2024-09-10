<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    public function handle($request, Closure $next, ...$roles)
    {
        $user = Auth::user(); // Obtener el usuario autenticado

        // Verificar si el usuario tiene uno de los roles permitidos
        if (!$user || !in_array($user->role->name, $roles)) {
            return response()->json(['message' => 'No tienes permiso para acceder a esta ruta.'], 403);
        }

        return $next($request); // Si tiene el rol adecuado, continuar con la solicitud
    }
}

