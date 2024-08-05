
<?php

namespace App\Http\Controllers;

use App\Models\Cedulas as Model;
use App\Http\Controllers\Controller;
use App\Models\Cedulas;
use Illuminate\Http\Request;

class CedulasController extends Controller
{
    use ApiResourceTrait,
        ApiCrudTrait
    ;
  

    protected $class = Model::class;
    public function show($cedula)
    {
        $datos = Cedulas::where('cedula_identidad', $cedula)->first(['nombres', 'apellidos', 'direccion_email', 'edad']);

        if ($datos) {
            return response()->json($datos);
        } else {
            return response()->json(['message' => 'Datos no encontrados'], 404);
        }
    }

    public function searchCedulas(Request $request)
    {
        $query = $request->input('query');
        $cedulas = Cedulas::where('cedula_identidad', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get(['cedula_identidad']);

        return response()->json($cedulas);
    }
}


