<?php
namespace App\Http\Controllers;

use App\Models\Peticiones as Model;
use App\Models\Peticiones;
use Illuminate\Http\Request;

class PeticionesController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;

    // public function index(Request $request)
    // {
    //     $user_id = $request->input('user_id');
    //     $role_id = $request->input('role_id');
    
    //     // Filtra las peticiones por user_id y role_id si están presentes
    //     $query = Peticiones::with(['user', 'zonas']);
    
    //     if ($user_id) {
    //         $query->where('user_id', $user_id);  // Filtrar por usuario activo
    //     }
    
    //     if ($role_id) {
    //         $query->orWhere('role_id', $role_id);  // Filtrar por rol
    //     }
    
    //     $peticiones = $query->get();
    
    //     return response()->json($peticiones);
    // }

}
