<?php

namespace App\Http\Controllers;

use App\Models\User;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
    public function show($id)
{
    try {
        // Encuentra al usuario por su ID
        $user = User::findOrFail($id);

        // Devuelve la información del usuario
        return response()->json(['user' => $user], 200);
    } catch (\Exception $e) {
        // Si algo sale mal, devuelve un error
        return response()->json(['message' => 'Usuario no encontrado', 'error' => $e->getMessage()], 404);
    }
}

    
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // Valida la confirmación de contraseña
            
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => 3, // Asigna el rol de "invitado" (rol con ID 3) por defecto
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
            return response()->json(['message' => 'Crendenciales incorrectas'], 401);
        }

        $user = Auth::user();

        // Genera y almacena el token en la columna remember_token
        $token = $this->generateToken($user);

        return response()->json(['access_token' => $token, 'token_type' => 'Bearer','role' => $user->role->name ], 200);
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
    // app/Http/Controllers/AuthController.php

    public function getAllUsersWithRoles()
    {
        $users = User::with('role') // Usa el método `with` para cargar la relación del rol
            ->get();
    
        return response()->json($users, 200);
    }

    public function destroy($id)
{
    try {
        $user = User::findOrFail($id); // Busca el usuario por ID, lanza excepción si no lo encuentra
        $user->delete(); // Elimina el usuario

        return response()->json(['message' => 'Usuario eliminado con éxito'], 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error al eliminar usuario', 'error' => $e->getMessage()], 500);
    }
}


public function update(Request $request, $id)
{
    // Validar los datos recibidos en la solicitud
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users,email,' . $id,
        'role_id' => 'required|integer|exists:role,id', // Valida que role_id sea un rol existente
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 400);
    }

    try {
        // Encontrar el usuario por su ID
        $user = User::findOrFail($id);

        // Actualizar los campos del usuario
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->role_id = $request->input('role_id');

        // Guardar los cambios
        $user->save();

        // Respuesta de éxito
        return response()->json(['message' => 'Usuario actualizado correctamente', 'user' => $user], 200);
    } catch (\Exception $e) {
        // Manejo de errores si ocurre un problema
        return response()->json(['message' => 'Error al actualizar el usuario', 'error' => $e->getMessage()], 500);
    }
}

    



}
