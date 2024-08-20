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
        $token = $request->header('Authorization');

        if ($token) {
            $token = str_replace('Bearer ', '', $token);
            $user = User::where('remember_token', $token)->first();

            if ($user) {
                // Autenticar al usuario
                auth()->login($user);
                return $next($request);
            }
        }

        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}
