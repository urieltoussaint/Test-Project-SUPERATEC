<?php
namespace App\Http\Controllers;

use App\Models\Procedencia as Model;
use App\Models\Procedencia;
use Illuminate\Http\Request;

class ProcedenciaController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


    public function validateCOD($cod)
{
    $cod =Procedencia ::where('cod', $cod)->first();

    if ($cod) {
        return response()->json(['message' => 'cod exists'], 200);
    } else {
        return response()->json(['message' => 'cod not found'], 404);
    }
}

public function getProcedenciasWithStatistics(Request $request)
{
    // 1. Consulta para obtener los datos paginados que se mostrarán en la tabla
    $queryPaginated = Procedencia::query();

    // Aplicar filtros a la consulta paginada
   
    if ($request->filled('descripcion')) {
        $queryPaginated->where('descripcion', 'ILIKE', "%{$request->descripcion}%");
    }
    
    // Obtener los datos paginados para mostrar en la tabla
    $datosPaginados = $queryPaginated->paginate(10);

    // 2. Consulta para obtener todos los datos filtrados (sin paginación) para las estadísticas
    $queryStatistics = Procedencia::query();

    // Aplicar filtros a la consulta para estadísticas
    if ($request->filled('descripcion')) {
        $queryStatistics->where('descripcion', 'ILIKE', "%{$request->descripcion}%");
    }

    // Obtener todos los datos filtrados para las estadísticas sin paginación
    $datosParaEstadisticas = $queryStatistics;

    // Calcular estadísticas generales en todos los datos filtrados
    $totalProcedencias = $datosParaEstadisticas->count();

    // Retornar los datos paginados y las estadísticas completas
    return response()->json([
        'datos' => $datosPaginados,
        'estadisticas' => [
            'totalProcedencias' => $totalProcedencias
           
        ],
    ]);
}

}
