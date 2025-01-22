<?php
namespace App\Http\Controllers;

use App\Models\ComoEnteroSuperatec;
use App\Models\DatosIdentificacion as Model;
use App\Models\DatosIdentificacion;
use App\Models\Estado;
use App\Models\Genero;
use App\Models\GrupoPrioritario;
use App\Models\InformacionInscripcion;
use App\Models\Nacionalidad;
use App\Models\NivelInstruccion;
use App\Models\Procedencia;
use Illuminate\Http\Request;
use App\Models\VistaDatosIdentificacion;  // Usa la vista

class DatosIdentificacionController extends Controller


{
    use ApiResourceTrait, ApiCrudTrait;
    protected $class = Model::class;

    public function searchByCedula1($cedula_identidad)
{
    $dato = DatosIdentificacion::where('cedula_identidad', $cedula_identidad)->first();

    if (!$dato) {
        return response()->json(['message' => 'No se encontró la cédula'], 404);
    }

    return response()->json($dato);
}



public function searchByCedula2(Request $request)
{
    $query = $request->input('query');
    
    $datos = DatosIdentificacion::where('cedula_identidad', 'LIKE', "%{$query}%")
        ->select('id', 'cedula_identidad')  // Solo devuelve la cedula e ID en la búsqueda
        ->get();

    if ($datos->isEmpty()) {
        return response()->json([], 404);
    }

    return response()->json($datos);
}

    public function getDatosByCedula($cedula)
    {
        $dato = DatosIdentificacion::where('cedula_identidad', $cedula)->first();

        if (!$dato) {
            return response()->json(['message' => 'Datos no encontrados'], 404);
        }

        return response()->json($dato);
    }

    

    public function fetchFilterOptions()
    {
        return response()->json([
            'nivel_instruccion' => NivelInstruccion::all(),
            'estado' => Estado::all(),
            'genero' => Genero::all(),
            'grupo_prioritario' => GrupoPrioritario::all(),
            'nacionalidad' => Nacionalidad::all(),
            'procedencia' => Procedencia::all(),
            'superatec' => ComoEnteroSuperatec::all(),
        ]);
    }



    public function getDataWithStatistics(Request $request)
{
    // 1. Consulta para obtener los datos paginados que se mostrarán en la tabla
    $queryPaginated = DatosIdentificacion::query()
        ->with(['nivelInstruccion', 'estado', 'genero', 'grupoPrioritario', 'comoEnteroSuperatec'])
        ->orderBy('id', 'desc'); // Ordena por id de forma descendente para mostrar los últimos primero

    // Aplicar filtros a la consulta paginada
    if ($request->filled('nivel_instruccion_id')) {
        $queryPaginated->where('nivel_instruccion_id', $request->nivel_instruccion_id);
    }
    if ($request->filled('estado_id')) {
        $queryPaginated->where('estado_id', $request->estado_id);
    }
    if ($request->filled('genero_id')) {
        $queryPaginated->where('genero_id', $request->genero_id);
    }
    if ($request->filled('grupo_prioritario_id')) {
        $queryPaginated->where('grupo_prioritario_id', $request->grupo_prioritario_id);
    }
    if ($request->filled('cedula_identidad')) {
        $queryPaginated->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
    }
    if ($request->filled('como_entero_superatec_id')) {
        $queryPaginated->where('como_entero_superatec_id', $request->como_entero_superatec_id);
    }

    // Obtener los datos paginados para mostrar en la tabla
    $datosPaginados = $queryPaginated->paginate(9);

    // 2. Consulta para obtener todos los datos filtrados (sin paginación) para las estadísticas
    $queryStatistics = DatosIdentificacion::query();

    // Aplicar los mismos filtros que en la consulta de paginación
    if ($request->filled('nivel_instruccion_id')) {
        $queryStatistics->where('nivel_instruccion_id', $request->nivel_instruccion_id);
    }
    if ($request->filled('estado_id')) {
        $queryStatistics->where('estado_id', $request->estado_id);
    }
    if ($request->filled('genero_id')) {
        $queryStatistics->where('genero_id', $request->genero_id);
    }
    if ($request->filled('grupo_prioritario_id')) {
        $queryStatistics->where('grupo_prioritario_id', $request->grupo_prioritario_id);
    }
    if ($request->filled('cedula_identidad')) {
        $queryStatistics->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
    }
    if ($request->filled('como_entero_superatec_id')) {
        $queryStatistics->where('como_entero_superatec_id', $request->como_entero_superatec_id);
    }

    // Obtener todos los datos filtrados para las estadísticas sin paginación
    $datosParaEstadisticas = $queryStatistics->with(['nivelInstruccion', 'estado', 'genero', 'grupoPrioritario', 'comoEnteroSuperatec'])->get();

    // Calcular estadísticas generales en todos los datos filtrados
    $totalParticipantes = $datosParaEstadisticas->count();
    $promedioEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->avg('edad') : 0;
    $mayorEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->max('edad') : 0;
    $menorEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->min('edad') : 0;

    // Calcular porcentajes de género
    $totalMasculino = $datosParaEstadisticas->where('genero_id', 1)->count();
    $totalFemenino = $datosParaEstadisticas->where('genero_id', 3)->count();
    $totalOtros = $datosParaEstadisticas->where('genero_id', 2)->count();
    $porcentajeMasculino = $totalParticipantes > 0 ? ($totalMasculino / $totalParticipantes) * 100 : 0;
    $porcentajeFemenino = $totalParticipantes > 0 ? ($totalFemenino / $totalParticipantes) * 100 : 0;
    $porcentajeOtros = $totalParticipantes > 0 ? ($totalOtros / $totalParticipantes) * 100 : 0;

    // Agrupar y calcular estadísticas adicionales
    $nivelesInstruccion = $datosParaEstadisticas->groupBy('nivelInstruccion.descripcion')->map(function ($group) use ($totalParticipantes) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalParticipantes > 0 ? ($count / $totalParticipantes) * 100 : 0
        ];
    });

    $participantesPorEstado = $datosParaEstadisticas->groupBy('estado.descripcion')->map(function ($group) use ($totalParticipantes) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalParticipantes > 0 ? ($count / $totalParticipantes) * 100 : 0
        ];
    });

    $grupoPrioritario = $datosParaEstadisticas->groupBy('grupoPrioritario.descripcion')->map(function ($group) use ($totalParticipantes) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalParticipantes > 0 ? ($count / $totalParticipantes) * 100 : 0
        ];
    });

    $comoEnteroSuperatec = $datosParaEstadisticas->groupBy('comoEnteroSuperatec.descripcion')->map(function ($group) use ($totalParticipantes) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalParticipantes > 0 ? ($count / $totalParticipantes) * 100 : 0
        ];
    });

    $rangoEdades = [
        '6-12' => $datosParaEstadisticas->whereBetween('edad', [6, 12])->count(),
        '13-17' => $datosParaEstadisticas->whereBetween('edad', [13, 17])->count(),
        '18-25' => $datosParaEstadisticas->whereBetween('edad', [18, 25])->count(),
        '26-35' => $datosParaEstadisticas->whereBetween('edad', [26, 35])->count(),
        'Más de 35' => $datosParaEstadisticas->where('edad', '>', 35)->count(),
    ];

    

    // Retornar los datos paginados y las estadísticas completas
    return response()->json([
        'datos' => $datosPaginados,
        'estadisticas' => [
            'totalParticipantes' => $totalParticipantes,
            'promedioEdad' => $promedioEdad,
            'mayorEdad' => $mayorEdad,
            'menorEdad' => $menorEdad,
            'porcentajesGenero' => [
                'masculino' => $porcentajeMasculino,
                'femenino' => $porcentajeFemenino,
                'otros' => $porcentajeOtros,
            ],
            'nivelesInstruccion' => $nivelesInstruccion,
            'rangoEdades' => $rangoEdades,
            'grupoPrioritario' => $grupoPrioritario,
            'comoEnteroSuperatec' => $comoEnteroSuperatec,
            'participantesPorEstado' => $participantesPorEstado,
        ],
    ]);
}


public function getDataWithStatisticsPrint(Request $request)
{
    // 1. Consulta para obtener los datos paginados que se mostrarán en la tabla
    $queryStatistics = DatosIdentificacion::query()
        ->with(['nivelInstruccion', 'estado', 'genero', 'grupoPrioritario', 'comoEnteroSuperatec'])
        ->orderBy('id', 'desc'); // Ordena por id de forma descendente para mostrar los últimos primero

    // Aplicar filtros a la consulta paginada
    if ($request->filled('nivel_instruccion_id')) {
        $queryStatistics->where('nivel_instruccion_id', $request->nivel_instruccion_id);
    }
    if ($request->filled('estado_id')) {
        $queryStatistics->where('estado_id', $request->estado_id);
    }
    if ($request->filled('genero_id')) {
        $queryStatistics->where('genero_id', $request->genero_id);
    }
    if ($request->filled('grupo_prioritario_id')) {
        $queryStatistics->where('grupo_prioritario_id', $request->grupo_prioritario_id);
    }
    if ($request->filled('cedula_identidad')) {
        $queryStatistics->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
    }
    if ($request->filled('como_entero_superatec_id')) {
        $queryStatistics->where('como_entero_superatec_id', $request->como_entero_superatec_id);
    }


    // Obtener todos los datos filtrados para las estadísticas sin paginación
    $datosParaEstadisticas = $queryStatistics->with(['nivelInstruccion', 'estado', 'genero', 'grupoPrioritario', 'comoEnteroSuperatec'])->get();

    // Calcular estadísticas generales en todos los datos filtrados
    $totalParticipantes = $datosParaEstadisticas->count();
    $promedioEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->avg('edad') : 0;
    $mayorEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->max('edad') : 0;
    $menorEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->min('edad') : 0;

    // Calcular porcentajes de género
    $totalMasculino = $datosParaEstadisticas->where('genero_id', 1)->count();
    $totalFemenino = $datosParaEstadisticas->where('genero_id', 3)->count();
    $totalOtros = $datosParaEstadisticas->where('genero_id', 2)->count();
    $porcentajeMasculino = $totalParticipantes > 0 ? ($totalMasculino / $totalParticipantes) * 100 : 0;
    $porcentajeFemenino = $totalParticipantes > 0 ? ($totalFemenino / $totalParticipantes) * 100 : 0;
    $porcentajeOtros = $totalParticipantes > 0 ? ($totalOtros / $totalParticipantes) * 100 : 0;

    // Agrupar y calcular estadísticas adicionales
    $nivelesInstruccion = $datosParaEstadisticas->groupBy('nivelInstruccion.descripcion')->map(function ($group) use ($totalParticipantes) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalParticipantes > 0 ? ($count / $totalParticipantes) * 100 : 0
        ];
    });

    $participantesPorEstado = $datosParaEstadisticas->groupBy('estado.descripcion')->map(function ($group) use ($totalParticipantes) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalParticipantes > 0 ? ($count / $totalParticipantes) * 100 : 0
        ];
    });

    $grupoPrioritario = $datosParaEstadisticas->groupBy('grupoPrioritario.descripcion')->map(function ($group) use ($totalParticipantes) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalParticipantes > 0 ? ($count / $totalParticipantes) * 100 : 0
        ];
    });

    $comoEnteroSuperatec = $datosParaEstadisticas->groupBy('comoEnteroSuperatec.descripcion')->map(function ($group) use ($totalParticipantes) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalParticipantes > 0 ? ($count / $totalParticipantes) * 100 : 0
        ];
    });

    $rangoEdades = [
        '6-12' => $datosParaEstadisticas->whereBetween('edad', [6, 12])->count(),
        '13-17' => $datosParaEstadisticas->whereBetween('edad', [13, 17])->count(),
        '18-25' => $datosParaEstadisticas->whereBetween('edad', [18, 25])->count(),
        '26-35' => $datosParaEstadisticas->whereBetween('edad', [26, 35])->count(),
        'Más de 35' => $datosParaEstadisticas->where('edad', '>', 35)->count(),
    ];

    $datos = $queryStatistics->get();

    // Retornar los datos paginados y las estadísticas completas
    return response()->json([
        'datos' => $datos,
        'estadisticas' => [
            'totalParticipantes' => $totalParticipantes,
            'promedioEdad' => $promedioEdad,
            'mayorEdad' => $mayorEdad,
            'menorEdad' => $menorEdad,
            'porcentajesGenero' => [
                'masculino' => $porcentajeMasculino,
                'femenino' => $porcentajeFemenino,
                'otros' => $porcentajeOtros,
            ],
            'nivelesInstruccion' => $nivelesInstruccion,
            'rangoEdades' => $rangoEdades,
            'grupoPrioritario' => $grupoPrioritario,
            'comoEnteroSuperatec' => $comoEnteroSuperatec,
            'participantesPorEstado' => $participantesPorEstado,
        ],
    ]);
}
    

    
    
    
    



    
    
    
}



