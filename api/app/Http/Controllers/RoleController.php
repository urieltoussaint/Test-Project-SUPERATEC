<?php
namespace App\Http\Controllers;

use App\Models\Cargo;
use App\Models\Role as Model;
use App\Models\Role;
use Illuminate\Http\Request;

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

    public function getRole(Request $request)
{
    // Consulta paginada para obtener los usuarios a mostrar en la tabla
    $queryPaginated = Role::query()
        ->orderBy('id', 'desc');

    // Aplicar filtros a la consulta paginada
    if ($request->filled('name')) {
        $queryPaginated->where('name', 'ILIKE', "%{$request->name}%");
    }

    // Obtener los datos paginados para mostrar en la tabla
    $rolesPaginated = $queryPaginated->paginate(10);

    // Retornar los datos paginados
    return response()->json([
        'roles' => $rolesPaginated,
    ]);
}
}
