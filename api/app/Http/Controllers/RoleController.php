<?php
namespace App\Http\Controllers;

use App\Models\Cargo;
use App\Models\Role as Model;
use App\Models\Role;

class RoleController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


    public function getRolesAndCargos()
    {
        $roles = Role::all(); // Obtener roles
        $cargos = Cargo::all(); // Obtener cargos

        return response()->json([
            'role' => $roles,
            'cargo_users' => $cargos,
        ]);
    }
}
