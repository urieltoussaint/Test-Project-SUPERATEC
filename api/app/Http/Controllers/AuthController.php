<?php

namespace App\Http\Controllers;

use App\Models\User;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;



class AuthController extends Controller
{
    public function show($id)
{
    try {
        // Encuentra al usuario por su ID
        $user = User::findOrFail($id);
        $user->makeHidden(['password']);
        return response()->json(['user' => $user], 200);

    } catch (\Exception $e) {
        // Si algo sale mal, devuelve un error
        return response()->json(['message' => 'Usuario no encontrado', 'error' => $e->getMessage()], 404);
    }
}

    
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // Valida la confirmación de contraseña
            
            
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id, // Asigna el rol de "invitado" (rol con ID 3) por defecto
            'cargo_id'=> $request->cargo_id,
            'nombre'=> $request->nombre,
            'apellido'=> $request->apellido,

        ]);

        // Genera y almacena el token en la columna remember_token
        $token = $this->generateToken($user);

        return response()->json(['message' => 'User registered successfully', 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('username', 'password'))) {
            return response()->json(['message' => 'Crendenciales incorrectas'], 401);
        }

        $user = Auth::user();

        // Genera y almacena el token en la columna remember_token
        $token = $this->generateToken($user);

        return response()->json(['access_token' => $token, 'token_type' => 'Bearer','role' => $user->role->name,'user'=>$user->id,'role_id'=>$user->role_id ], 200);
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

    public function getAllUsersWithRoles(Request $request)
{
    // Usa paginación para limitar la cantidad de registros por solicitud
    $users = User::with('role','cargo')
        ->paginate(10); // Cambia el número de registros por página según tu necesidad

    return response()->json($users, 200);
}


    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Verifica si el usuario es el último administrador
            if ($user->role->username === 'admin' && User::where('role_id', $user->role_id)->count() === 1) {
                return response()->json(['message' => 'No se puede eliminar el último administrador'], 403);
            }
    
            $user->delete();
            return response()->json(['message' => 'Usuario eliminado con éxito'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar usuario', 'error' => $e->getMessage()], 500);
        }
    }
    


    public function update(Request $request, $id)
    {
        // Validar los datos recibidos en la solicitud
        $validator = Validator::make($request->all(), [
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users')->ignore($id), // Ignorar el ID actual para la unicidad
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id), // Ignorar el ID actual para la unicidad
            ],
            'role_id' => 'required|integer|exists:role,id', // Valida que role_id sea un rol existente
            'cargo_id'=> 'required|integer|exists:cargo_users,id', // Valida que role_id sea un rol existente
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'password' => 'nullable|string|min:8|confirmed', // Contraseña opcional, mínimo 8 caracteres y debe confirmarse
            'password_confirmation' => 'nullable|string|min:8', // Confirmación opcional también
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
    
        try {
            // Encontrar el usuario por su ID
            $user = User::findOrFail($id);
    
            // Actualizar los campos del usuario
            $user->username = $request->input('username');
            $user->email = $request->input('email');
            $user->role_id = $request->input('role_id');
            $user->cargo_id = $request->input('cargo_id');
            $user->nombre = $request->input('nombre');
            $user->apellido = $request->input('apellido');
    
            // Actualizar la contraseña solo si se proporciona una nueva
            if ($request->filled('password')) {
                $user->password = Hash::make($request->input('password'));
            }
    
            // Guardar los cambios
            $user->save();
    
            // Respuesta de éxito
            return response()->json(['message' => 'Usuario actualizado correctamente', 'user' => $user], 200);
        } catch (\Exception $e) {
            // Manejo de errores si ocurre un problema
            return response()->json(['message' => 'Error al actualizar el usuario', 'error' => $e->getMessage()], 500);
        }
    }
    


public function validateUsername($username)
{
    $user = User::where('username', $username)->first();

    if ($user) {
        return response()->json(['message' => 'Username exists'], 200);
    } else {
        return response()->json(['message' => 'Username not found'], 404);
    }
}


    



}
