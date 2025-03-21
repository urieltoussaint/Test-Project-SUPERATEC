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
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;


class DatosIdentificacionController extends Controller


{
    use ApiResourceTrait, ApiCrudTrait;
    protected $class = Model::class;

    public function store(Request $request)
    {
        // Si la solicitud incluye 'participantes', procesarlos primero
        if ($request->has('participantes')) {
            $participantes = $request->participantes;
    
            if (is_array($participantes)) {
                // Si es un array, insertar múltiples registros
                $nuevosParticipantes = collect($participantes)->map(function ($participante) {
                    return DatosIdentificacion::create([
                        'cedula_identidad' => $participante['cedula_identidad'] ?? null,
                        'nombres' => $participante['nombres'] ?? '',
                        'apellidos' => $participante['apellidos'] ?? '',
                        'fecha_nacimiento' => $participante['fecha_nacimiento'] ?? null,
                        'genero_id' => $participante['genero_id'] ?? null,
                        'direccion' => $participante['direccion'] ?? '',
                        'nivel_instruccion_id' => $participante['nivel_instruccion_id'] ?? null,
                        'direccion_email' => $participante['direccion_email'] ?? '',
                        'telefono_celular' => $participante['telefono_celular'] ?? '',
                        'superatec' => $participante['superatec'] ?? false,
                    ]);
                });
    
                // Convertir la colección a un array de IDs y cédulas
                $participantesConIds = $nuevosParticipantes->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'cedula_identidad' => $p->cedula_identidad
                    ];
                });
    
                return response()->json([
                    'participantes' => $participantesConIds
                ], 201);
            } elseif (is_object($participantes)) {
                // Si es un solo objeto, insertarlo individualmente
                $nuevoParticipante = DatosIdentificacion::create([
                    'cedula_identidad' => $participantes->cedula_identidad ?? null,
                    'nombres' => $participantes->nombres ?? '',
                    'apellidos' => $participantes->apellidos ?? '',
                    'fecha_nacimiento' => $participantes->fecha_nacimiento ?? null,
                    'genero_id' => $participantes->genero_id ?? null,
                    'direccion' => $participantes->direccion ?? '',
                    'nivel_instruccion_id' => $participantes->nivel_instruccion_id ?? null,
                    'direccion_email' => $participantes->direccion_email ?? '',
                    'telefono_celular' => $participantes->telefono_celular ?? '',
                    'superatec' => $participantes->superatec ?? false,
                ]);
    
                return response()->json([
                    'participantes' => [
                        [
                            'id' => $nuevoParticipante->id,
                            'cedula_identidad' => $nuevoParticipante->cedula_identidad
                        ]
                    ]
                ], 201);
            }
        }
    
        // Si no hay participantes, procesar la solicitud normal
        $resource = $this->new(
            $this->class,
            $request
        );
    
        return response($resource, 201);
    }
    

    
    

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
    $mayorEdad = $request->input('mayor_edad'); // Flag opcional para filtrar mayores de edad

    $datos = DatosIdentificacion::where('cedula_identidad', 'LIKE', "%{$query}%")
        ->select('id', 'cedula_identidad', 'fecha_nacimiento') // Agregar fecha de nacimiento para filtro
        ->get();

    // Si el flag 'mayor_edad' está presente y es true, filtrar mayores de 18 años
    if ($mayorEdad) {
        $fechaActual = now()->subYears(18)->format('Y-m-d'); // Fecha límite para ser mayor de edad
        $datos = $datos->filter(function ($dato) use ($fechaActual) {
            return $dato->fecha_nacimiento <= $fechaActual;
        });
    }

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
        ->selectRaw("*, DATE_PART('year', AGE(fecha_nacimiento)) as edad")

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
    $datosParaEstadisticas = $queryStatistics->with(['nivelInstruccion', 'estado', 'genero', 'grupoPrioritario', 'comoEnteroSuperatec'])
    ->selectRaw("*, DATE_PART('year', AGE(fecha_nacimiento)) as edad")
    ->get();

    // Calcular estadísticas generales en todos los datos filtrados
    $totalParticipantes = $datosParaEstadisticas->count();
   

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

    $promedioEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->avg('edad') : 0;
    $mayorEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->max('edad') : 0;
    $menorEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->min('edad') : 0;
      // Cálculo de edades en rangos
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
    // 1. Consulta para obtener los datos con las descripciones en lugar de los IDs
    $queryStatistics = DatosIdentificacion::query()
        ->select(
            'datos_identificacion.id',
            'datos_identificacion.nombres',
            'datos_identificacion.apellidos',
            'datos_identificacion.fecha_nacimiento',
            'datos_identificacion.direccion',
            'datos_identificacion.direccion_email',
            'datos_identificacion.telefono_celular',
            'datos_identificacion.telefono_casa',
            'datos_identificacion.cedula_identidad',
            'datos_identificacion.created_at',
            'datos_identificacion.municipio',
            'estado.descripcion as estado',
            'genero.descripcion as genero',
            'nivel_instruccion.descripcion as nivel_instruccion',
            'grupo_prioritario.descripcion as grupo_prioritario',
            'como_entero_superatec.descripcion as como_entero_superatec',
            DB::raw("DATE_PART('year', AGE(fecha_nacimiento)) as edad")

        )
        ->leftJoin('estado', 'datos_identificacion.estado_id', '=', 'estado.id')
        ->leftJoin('genero', 'datos_identificacion.genero_id', '=', 'genero.id')
        ->leftJoin('nivel_instruccion', 'datos_identificacion.nivel_instruccion_id', '=', 'nivel_instruccion.id')
        ->leftJoin('grupo_prioritario', 'datos_identificacion.grupo_prioritario_id', '=', 'grupo_prioritario.id')
        ->leftJoin('como_entero_superatec', 'datos_identificacion.como_entero_superatec_id', '=', 'como_entero_superatec.id')
        ->orderBy('datos_identificacion.id', 'desc');

    // Aplicar filtros
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

    // Obtener los datos transformados
    $datosParaEstadisticas = $queryStatistics->get();

    // Calcular estadísticas
    $totalParticipantes = $datosParaEstadisticas->count();
    $promedioEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->avg('edad') : 0;
    $mayorEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->max('edad') : 0;
    $menorEdad = $totalParticipantes > 0 ? $datosParaEstadisticas->min('edad') : 0;

    // Calcular porcentajes de género
    $totalMasculino = $datosParaEstadisticas->where('genero', 'Masculino')->count();
    $totalFemenino = $datosParaEstadisticas->where('genero', 'Femenino')->count();
    $totalOtros = $datosParaEstadisticas->whereNotIn('genero', ['Masculino', 'Femenino'])->count();
    $porcentajeMasculino = $totalParticipantes > 0 ? ($totalMasculino / $totalParticipantes) * 100 : 0;
    $porcentajeFemenino = $totalParticipantes > 0 ? ($totalFemenino / $totalParticipantes) * 100 : 0;
    $porcentajeOtros = $totalParticipantes > 0 ? ($totalOtros / $totalParticipantes) * 100 : 0;

    // Agrupar estadísticas adicionales
    $nivelesInstruccion = $datosParaEstadisticas->groupBy('nivel_instruccion')->map(function ($group) use ($totalParticipantes) {
        return [
            'count' => $group->count(),
            'percentage' => $totalParticipantes > 0 ? ($group->count() / $totalParticipantes) * 100 : 0
        ];
    });

    $participantesPorEstado = $datosParaEstadisticas->groupBy('estado')->map(function ($group) use ($totalParticipantes) {
        return [
            'count' => $group->count(),
            'percentage' => $totalParticipantes > 0 ? ($group->count() / $totalParticipantes) * 100 : 0
        ];
    });

    $grupoPrioritario = $datosParaEstadisticas->groupBy('grupo_prioritario')->map(function ($group) use ($totalParticipantes) {
        return [
            'count' => $group->count(),
            'percentage' => $totalParticipantes > 0 ? ($group->count() / $totalParticipantes) * 100 : 0
        ];
    });

    $comoEnteroSuperatec = $datosParaEstadisticas->groupBy('como_entero_superatec')->map(function ($group) use ($totalParticipantes) {
        return [
            'count' => $group->count(),
            'percentage' => $totalParticipantes > 0 ? ($group->count() / $totalParticipantes) * 100 : 0
        ];
    });

    // Calcular rangos de edad
    $rangoEdades = [
        '6-12' => $datosParaEstadisticas->whereBetween('edad', [6, 12])->count(),
        '13-17' => $datosParaEstadisticas->whereBetween('edad', [13, 17])->count(),
        '18-25' => $datosParaEstadisticas->whereBetween('edad', [18, 25])->count(),
        '26-35' => $datosParaEstadisticas->whereBetween('edad', [26, 35])->count(),
        'Más de 35' => $datosParaEstadisticas->where('edad', '>', 35)->count(),
    ];

    return response()->json([
        'datos' => $datosParaEstadisticas,
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



