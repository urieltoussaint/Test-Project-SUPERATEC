<?php
// app/Http/Middleware/AuthenticateWithToken.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class AuthenticateWithToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->header('Authorization'); // Obtiene el token de la cabecera

        if ($token) {
            // Remover el prefijo "Bearer " del token
            $token = str_replace('Bearer ', '', $token);

            // Busca al usuario en la base de datos por su remember_token
            $user = User::where('remember_token', $token)->first();

            if ($user) {
                // Autenticar al usuario si el token coincide
                auth()->login($user);

                // Continuar con la solicitud
                return $next($request);
            }
        }

        // Si el token no es válido, retorna error de autenticación
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}
