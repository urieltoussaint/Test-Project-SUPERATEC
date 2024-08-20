<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Genera y almacena el token en la columna remember_token
        $token = $this->generateToken($user);

        return response()->json(['message' => 'User registered successfully', 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid login credentials'], 401);
        }

        $user = Auth::user();

        // Genera y almacena el token en la columna remember_token
        $token = $this->generateToken($user);

        return response()->json(['access_token' => $token, 'token_type' => 'Bearer'], 200);
    }

    protected function generateToken(User $user)
    {
        $token = bin2hex(random_bytes(32)); // Genera un token simple

        // Almacena el token en la columna remember_token
        $user->remember_token = $token;
        $user->save();

        return $token;
    }

    public function logout(Request $request)
{
    $user = $request->user();

    if ($user) {
        // Elimina el token
        $user->remember_token = null;
        $user->save();

        return response()->json(['message' => 'Logged out successfully'], 200);
    } else {
        return response()->json(['message' => 'User not authenticated or already logged out'], 401);
    }
}


    public function index(Request $request)
    {
        return response()->json($request->user());
    }
}
