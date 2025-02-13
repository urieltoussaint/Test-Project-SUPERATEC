<?php

namespace App\Http\Controllers;

use App\Models\InformacionInscripcion;
use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Centro;
use App\Models\Cohorte;
use App\Models\Estado;
use App\Models\Genero;
use App\Models\Modalidad;
use App\Models\Nivel;
use App\Models\Periodo;
use App\Models\TipoPrograma;
use App\Models\Unidad;
use App\Models\Grupo;
use App\Models\NivelInstruccion;
use App\Models\Patrocinante;
use App\Models\Procedencia;
use App\Models\TipoPago;
use App\Models\FormaPago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InformacionInscripcionController extends Controller
{
    use ApiResourceTrait,
        ApiCrudTrait
    ;

    protected $class = InformacionInscripcion::class;


    public function index(Request $request, $datos_identificacion_id = null)
    {
        // Verificar si datos_identificacion_id viene como parámetro o en la query string
        $cursoId = $request->query('curso_id');
        $datosIdentificacionId = $datos_identificacion_id ?? $request->query('datos_identificacion_id');
    
        // Iniciar la consulta base
        $inscripcionesQuery = InformacionInscripcion::query();
    
        // Filtrar por curso_id si está presente
        if ($cursoId) {
            $inscripcionesQuery->where('curso_id', $cursoId);
        }
    
        // Filtrar por datos_identificacion_id si está presente
        if ($datosIdentificacionId) {
            $inscripcionesQuery->where('datos_identificacion_id', $datosIdentificacionId);
        }
    
        // Cargar relaciones y paginar los resultados
        $inscripciones = $inscripcionesQuery
            ->with('datosIdentificacion', 'curso', 'periodo', 'cohorte', 'centro', 'Patrocinante1')
            ->paginate(20);
    
        return response()->json($inscripciones);
    }
    


public function show($id)
{
    // Obtener la inscripción con la relación de curso
    $inscripcion = InformacionInscripcion::with('curso','datosIdentificacion','centro','cohorte','periodo')->find($id);


    // Verificar si la inscripción existe
    if (!$inscripcion) {
        return response()->json(['message' => 'Inscripción no encontrada'], 404);
    }

    // Retornar la inscripción con su relación
    return response()->json($inscripcion);
}

public function SelectInsc()
{
   
        $cohorte = Cohorte::all();
        $centro = Centro::all();
        $periodo = Periodo::all();
        $area=Area::all();
        $unidad=Unidad::all();
        $modalidad=Modalidad::all();
        $nivel=Nivel::all();
        $tipoPrograma=TipoPrograma::all();
        $grupo=Grupo::all();

  

        return response()->json([
            'cohorte' => $cohorte,
            'centro' => $centro,
            'periodo' => $periodo,
            'area'=>$area,
            'unidad'=>$unidad,
            'modalidad'=>$modalidad,
            'nivel'=>$nivel,
            'tipoPrograma'=>$tipoPrograma,
            'grupo'=>$grupo
     
            
        ]);
    
}


public function validarInscripcion(Request $request)
{
    // Validar que los parámetros sean correctos
    $request->validate([
        'curso_id' => 'required|integer',
        'cedula_identidad' => 'required|string',
    ]);

    // Obtener los parámetros de la solicitud
    $cursoId = $request->input('curso_id');
    $cedulaIdentidad = $request->input('cedula_identidad');

    // Comprobar si la cédula ya está inscrita en el curso
    $inscripcionExistente = DB::table('informacion_inscripcion')
        ->join('datos_identificacion', 'informacion_inscripcion.datos_identificacion_id', '=', 'datos_identificacion.id')
        ->where('informacion_inscripcion.curso_id', $cursoId)
        ->where('datos_identificacion.cedula_identidad', $cedulaIdentidad)
        ->exists();

    // Si la inscripción ya existe, devolver una respuesta indicando que ya está inscrito
    if ($inscripcionExistente) {
        return response()->json(['alreadyRegistered' => true], 200);
    } else {
        return response()->json(['alreadyRegistered' => false], 200);
    }
}

public function fetchFilterOptions()
{
        $centro = Centro::all();
        $cohorte = Cohorte::all();
        $periodo = Periodo::all();
        $tipo_pago=TipoPago::all();
        $forma_pago = FormaPago::all();
   
        return response()->json([
            'centro' => $centro,
            'cohorte' =>$cohorte,
            'periodo'=>$periodo,
            'tipo_pago'=>$tipo_pago,
            'forma_pago'=>$forma_pago,
         
        ]);
} 

public function fetchFilterIndicadoresOptions()
{
        $centro = Centro::all();
        $cohorte = Cohorte::all();
        $periodo = Periodo::all();
        $genero= Genero::all();
        $area= Area:: all();
        $nivelInstruccion = NivelInstruccion:: all();
        $estado = Estado :: all();
        $unidad = Unidad ::all();
        $patrocinante = Patrocinante ::all();
        $procedencia = Procedencia ::all();
        $grupo = Grupo ::all();


   
        return response()->json([
            'centro' => $centro,
            'cohorte' =>$cohorte,
            'periodo'=>$periodo,
            'genero'=>$genero,
            'area'=>$area,
            'nivelInstruccion'=>$nivelInstruccion,
            'estado'=> $estado,
            'unidad'=>$unidad,
            'patrocinante'=>$patrocinante,
            'procedencia'=>$procedencia,
            'grupo'=> $grupo,
         
        ]);
} 




public function getInscripcionesWithStatistics(Request $request, $cursoId)
{
    // Verificar si el curso_id está presente (se obtiene como parámetro de la ruta)
    if (!$cursoId) {
        return response()->json(['error' => 'El curso_id es obligatorio'], 400);
    }

    // Consulta paginada con filtros
    $queryPaginated = InformacionInscripcion::query()
        ->with(['centro', 'periodo', 'cohorte', 'datosIdentificacion'])
        ->where('curso_id', $cursoId) // Filtrar por curso_id
        ->orderBy('id', 'desc'); // Ordenar por ID descendente

    // Aplicar filtros adicionales 
    if ($request->filled('cohorte_id')) {
        $queryPaginated->where('cohorte_id', $request->cohorte_id);
    }
    if ($request->filled('centro_id')) {
        $queryPaginated->where('centro_id', $request->centro_id);
    }
    if ($request->filled('periodo_id')) {
        $queryPaginated->where('periodo_id', $request->periodo_id);
    }
    if ($request->filled('status_pay')) {
        $queryPaginated->where('status_pay', $request->status_pay);
    }
    if ($request->filled('status_curso')) {
        $queryPaginated->where('status_curso', $request->status_curso);
    }


    // Obtener los datos paginados para mostrar en la tabla
    $datosPaginados = $queryPaginated->paginate(9);

    // Consulta para estadísticas (sin paginación)
    $queryStatistics = InformacionInscripcion::query()
        ->where('curso_id', $cursoId) // Filtrar por curso_id
        ->with(['centro', 'periodo', 'cohorte', 'datosIdentificacion']);

    // Aplicar los mismos filtros adicionales
    if ($request->filled('cohorte_id')) {
        $queryStatistics->where('cohorte_id', $request->cohorte_id);
    }
    if ($request->filled('centro_id')) {
        $queryStatistics->where('centro_id', $request->centro_id);
    }
    if ($request->filled('periodo_id')) {
        $queryStatistics->where('periodo_id', $request->periodo_id);
    }
    if ($request->filled('status_pay')) {
        $queryStatistics->where('status_pay', $request->status_pay);
    }
    if ($request->filled('status_curso')) {
        $queryStatistics->where('status_curso', $request->status_curso);
    }
    if ($request->filled('cedula_identidad')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
        });
    }

    // Obtener todos los datos filtrados para estadísticas
    $datosParaEstadisticas = $queryStatistics->get();

    // Calcular estadísticas generales
    $totalInscritos = $datosParaEstadisticas->count();
    $edades = $datosParaEstadisticas->pluck('datosIdentificacion.edad')->filter();

    $menorEdad = $edades->min();
    $mayorEdad = $edades->max();
    $promedioEdad = $edades->average();

    // Definir nombres para estados de pagos
    $nombresEstadoPagos = [
        1 => 'No pagado (Rojo)',
        2 => 'En proceso (Naranja)',
        3 => 'Pagado (Verde)',
        4 => 'Patrocinado (Azul)',
        5 => 'Exonerado (Rosado)'
    ];

    // Conteo por estado de pagos con nombres
    $estadoPagos = [];
    foreach ($nombresEstadoPagos as $key => $name) {
        $count = $datosParaEstadisticas->where('status_pay', $key)->count();
        $estadoPagos[] = [
            'nombre' => $name,
            'cantidad' => $count
        ];
    }

    // Definir nombres para estados de curso
    $nombresEstadoCursos = [
        1 => 'No finalizado',
        2 => 'Egresado/Certificado',
        3 => 'Retirado'
    ];

    // Conteo por estado de curso con nombres
    $estadoCursos = [];
    foreach ($nombresEstadoCursos as $key => $name) {
        $count = $datosParaEstadisticas->where('status_curso', $key)->count();
        $estadoCursos[] = [
            'nombre' => $name,
            'cantidad' => $count
        ];
    }

    // Retornar los datos paginados y estadísticas
    return response()->json([
        'datos' => $datosPaginados,
        'estadisticas' => [
            'totalInscritos' => $totalInscritos,
            'menorEdad' => $menorEdad,
            'mayorEdad' => $mayorEdad,
            'promedioEdad' => $promedioEdad,
            'estadoPagos' => $estadoPagos,
            'estadoCursos' => $estadoCursos
        ],
    ]);
}


public function getDatosCursos(Request $request, $datos_identificacion_id = null)
{
    // Verificar si datos_identificacion_id viene como parámetro o en la query string
    $cursoId = $request->query('curso_id');
    $datosIdentificacionId = $datos_identificacion_id ?? $request->query('datos_identificacion_id');

    // Iniciar la consulta base
    $queryPaginated = InformacionInscripcion::query()
    ->with(['curso']);

    // Filtrar por curso_id si está presente
    if ($cursoId) {
        $queryPaginated->where('curso_id', $cursoId);
    }

    // Filtrar por datos_identificacion_id si está presente
    if ($datosIdentificacionId) {
        $queryPaginated->where('datos_identificacion_id', $datosIdentificacionId);
    }
    // Consulta paginada con filtros
    

    if ($request->filled('cohorte_id')) {
        $queryPaginated->where('cohorte_id', $request->cohorte_id);
    }
    if ($request->filled('centro_id')) {
        $queryPaginated->where('centro_id', $request->centro_id);
    }
    if ($request->filled('periodo_id')) {
        $queryPaginated->where('periodo_id', $request->periodo_id);
    }
    if ($request->filled('status_pay')) {
        $queryPaginated->where('status_pay', $request->status_pay);
    }
    if ($request->filled('status_curso')) {
        $queryPaginated->where('status_curso', $request->status_curso);
    }

     
    if ($request->filled('nivel_id')) {
        $queryPaginated->whereHas('curso', function ($query) use ($request) {
            $query->where('nivel_id', $request->nivel_id);
        });
    }
    if ($request->filled('area_id')) {
        $queryPaginated->whereHas('curso', function ($query) use ($request) {
            $query->where('area_id', $request->area_id);
        });
    }
    if ($request->filled('modalidad_id')) {
        $queryPaginated->whereHas('curso', function ($query) use ($request) {
            $query->where('modalidad_id', $request->modalidad_id);
        });
    }
    if ($request->filled('tipo_programa_id')) {
        $queryPaginated->whereHas('curso', function ($query) use ($request) {
            $query->where('tipo_programa_id', $request->tipo_programa_id);
        });
    }
    if ($request->filled('unidad_id')) {
        $queryPaginated->whereHas('curso', function ($query) use ($request) {
            $query->where('unidad_id', $request->unidad_id);
        });
    }
    

    $datosPaginados = $queryPaginated->paginate(9);


    $queryStatistics = InformacionInscripcion::query();

    // Filtrar por curso_id si está presente
    if ($cursoId) {
        $queryStatistics->where('curso_id', $cursoId);
    }

    // Filtrar por datos_identificacion_id si está presente
    if ($datosIdentificacionId) {
        $queryStatistics->where('datos_identificacion_id', $datosIdentificacionId);
    }
    // Consulta paginada con filtros
    
    if ($request->filled('cohorte_id')) {
        $queryStatistics->where('cohorte_id', $request->cohorte_id);
    }
    if ($request->filled('centro_id')) {
        $queryStatistics->where('centro_id', $request->centro_id);
    }
    if ($request->filled('periodo_id')) {
        $queryStatistics->where('periodo_id', $request->periodo_id);
    }
    if ($request->filled('status_pay')) {
        $queryStatistics->where('status_pay', $request->status_pay);
    }
    if ($request->filled('status_curso')) {
        $queryStatistics->where('status_curso', $request->status_curso);
    }

     
    if ($request->filled('nivel_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('nivel_id', $request->nivel_id);
        });
    }
    if ($request->filled('area_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('area_id', $request->area_id);
        });
    }
    if ($request->filled('modalidad_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('modalidad_id', $request->modalidad_id);
        });
    }
    if ($request->filled('tipo_programa_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('tipo_programa_id', $request->tipo_programa_id);
        });
    }
    if ($request->filled('unidad_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('unidad_id', $request->unidad_id);
        });
    }
    

    $datosParaEstadisticas = $queryStatistics->get();

    // Calcular estadísticas generales
    $totalCursos = $datosParaEstadisticas->count();

    $horasCursando = $datosParaEstadisticas->where('status_curso', 1)->sum(function ($item) {
        return $item->curso->cantidad_horas ?? 0;
    });
    $horasFinalizadas = $datosParaEstadisticas->where('status_curso', 2)->sum(function ($item) {
        return $item->curso->cantidad_horas ?? 0;
    });

    $cursosPorEstadoCurso = $datosParaEstadisticas->groupBy('status_curso')->map(function ($group, $status) {
        $labels = [1 => 'No Finalizado', 2 => 'Egresado/Certificado', 3 => 'Retirado'];
        return [
            'count' => $group->count(),
            'description' => $labels[$status] ?? 'Desconocido',
        ];
    });

    $cursosPorEstadoPago = $datosParaEstadisticas->groupBy('status_pay')->map(function ($group, $status) {
        $labels = [
            1 => 'No Pagado (Rojo)',
            2 => 'En Proceso (Naranja)',
            3 => 'Pagado (Verde)',
            4 => 'Patrocinado (Azul)',
            5 => 'Exonerado (Rosado)',
        ];
        return [
            'count' => $group->count(),
            'description' => $labels[$status] ?? 'Desconocido',
        ];
    });

    $cursosPorCohorte = $datosParaEstadisticas->groupBy('cohorte.descripcion')->map(function ($group, $descripcion) {
        return [
            'count' => $group->count(),
            'description' => $descripcion,
        ];
    });

    $cursosPorPeriodo = $datosParaEstadisticas->groupBy('periodo.descripcion')->map(function ($group, $descripcion) {
        return [
            'count' => $group->count(),
            'description' => $descripcion,
        ];
    });

    $cursosPorNivel = $datosParaEstadisticas->groupBy('curso.nivel.descripcion')->map(function ($group, $descripcion) {
        return [
            'count' => $group->count(),
            'description' => $descripcion,
        ];
    });

    $cursosPorArea = $datosParaEstadisticas->groupBy('curso.area.descripcion')->map(function ($group, $descripcion) {
        return [
            'count' => $group->count(),
            'description' => $descripcion,
        ];
    });

    $cursosPorModalidad = $datosParaEstadisticas->groupBy('curso.modalidad.descripcion')->map(function ($group, $descripcion) {
        return [
            'count' => $group->count(),
            'description' => $descripcion,
        ];
    });

    $cursosPorTipoPrograma = $datosParaEstadisticas->groupBy('curso.tipoPrograma.descripcion')->map(function ($group, $descripcion) {
        return [
            'count' => $group->count(),
            'description' => $descripcion,
        ];
    });

    $cursosPorUnidad = $datosParaEstadisticas->groupBy('curso.unidad.descripcion')->map(function ($group, $descripcion) {
        return [
            'count' => $group->count(),
            'description' => $descripcion,
        ];
    });
    $statusNoFinalizado = $datosParaEstadisticas->where('status_curso', 1)->count();
    $statusEgresado = $datosParaEstadisticas->where('status_curso', 2)->count();
    $statusRetirado = $datosParaEstadisticas->where('status_curso', 3)->count();



    return response()->json([
        'datos' => $datosPaginados,
        'estadisticas' => [
            'totalCursos' => $totalCursos,
            'horasCursando' => $horasCursando,
            'horasFinalizadas' => $horasFinalizadas,
            'cursosPorEstadoCurso' => $cursosPorEstadoCurso,
            'cursosPorEstadoPago' => $cursosPorEstadoPago,
            'cursosPorCohorte' => $cursosPorCohorte,
            'cursosPorPeriodo' => $cursosPorPeriodo,
            'cursosPorNivel' => $cursosPorNivel,
            'cursosPorArea' => $cursosPorArea,
            'cursosPorModalidad' => $cursosPorModalidad,
            'cursosPorTipoPrograma' => $cursosPorTipoPrograma,
            'cursosPorUnidad' => $cursosPorUnidad,
            'statusNoFinalizado' => $statusNoFinalizado,
            'statusEgresado' => $statusEgresado,
            'statusRetirado' => $statusRetirado,
        ],
    ]);

   

}


public function getIndicadoresWithStatistics(Request $request)
{
    

    // Consulta paginada con filtros
    $queryPaginated = InformacionInscripcion::query()
        ->with(['centro', 'periodo', 'cohorte', 'datosIdentificacion','curso','datosIdentificacion.procedencia','datosIdentificacion.estado','curso.grupo'])
        ->orderBy('id', 'desc'); // Ordenar por ID descendente

    // Aplicar filtros adicionales 
    if ($request->filled('cohorte_id')) {
        $queryPaginated->where('cohorte_id', $request->cohorte_id);
    }
    if ($request->filled('centro_id')) {
        $queryPaginated->where('centro_id', $request->centro_id);
    }
    if ($request->filled('periodo_id')) {
        $queryPaginated->where('periodo_id', $request->periodo_id);
    }
    if ($request->filled('status_pay')) {
        $queryPaginated->where('status_pay', $request->status_pay);
    }
    if ($request->filled('status_curso')) {
        $queryPaginated->where('status_curso', $request->status_curso);
    }
    if ($request->filled('genero_id')) {
        $queryPaginated->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('genero_id', $request->genero_id);
        });
    }
    if ($request->filled('es_patrocinado')) {
        $queryPaginated->where('es_patrocinado', filter_var($request->es_patrocinado, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE));
    }
    
    if ($request->filled('patrocinante_id')) {
        $queryPaginated->where('patrocinante_id', $request->patrocinante_id);
    }
    if ($request->filled('patrocinante_id2')) {
        $queryPaginated->where('patrocinante_id2', $request->patrocinante_id2);
    }
    if ($request->filled('patrocinante_id3')) {
        $queryPaginated->where('patrocinante_id3', $request->patrocinante_id3);
    }
    if ($request->filled('fecha_inscripcion')) {
        $queryPaginated->where('fecha_inscripcion', '>=', $request->fecha_inscripcion);
    }
    
    if ($request->filled('procedencia_id')) {
        $queryPaginated->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('procedencia_id', $request->procedencia_id);
        });
    }
    if ($request->filled('nivel_instruccion_id')) {
        $queryPaginated->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('nivel_instruccion_id', $request->nivel_instruccion_id);
        });
    }
    if ($request->filled('estado_id')) {
        $queryPaginated->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('estado_id', $request->estado_id);
        });
    }
    if ($request->filled('cedula_identidad')) { 
        $queryPaginated->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('cedula_identidad', 'ILIKE', "%{$request->cedula_identidad}%");
        });
    }
    if ($request->filled('nombres')) { 
        $queryPaginated->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('nombres', 'ILIKE', "%{$request->nombres}%");
        });
    }
    if ($request->filled('apellidos')) { 
        $queryPaginated->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('apellidos', 'ILIKE', "%{$request->apellidos}%");
        });
    }

    // Si en el request se envía 'tlf', aplicar el filtro correspondiente
    if ($request->filled('tlf')) {
        $queryPaginated->whereHas('datosIdentificacion', function ($query) use ($request) {
            if ($request->tlf === 'true') {
                $query->whereNotNull('telefono_celular'); // Filtrar registros con teléfono no nulo
            } elseif ($request->tlf === 'false') {
                $query->whereNull('telefono_celular'); // Filtrar registros con teléfono nulo
            }
        });
    }

    if ($request->filled('centro_id')) {
        $queryPaginated->whereHas('curso', function ($query) use ($request) {
            $query->where('centro_id', $request->centro_id);
        });
    }
    if ($request->filled('grupo_id')) {
        $queryPaginated->whereHas('curso', function ($query) use ($request) {
            $query->where('grupo_id', $request->grupo_id);
        });
    }
    if ($request->filled('area_id')) {
        $queryPaginated->whereHas('curso', function ($query) use ($request) {
            $query->where('area_id', $request->area_id);
        });
    }


    // Obtener los datos paginados para mostrar en la tabla
    $datosPaginados = $queryPaginated->paginate(9);

    // Consulta para estadísticas (sin paginación)
    $queryStatistics = InformacionInscripcion::query()
        ->with(['centro', 'periodo', 'cohorte', 'datosIdentificacion']);
     // Aplicar filtros adicionales 
     if ($request->filled('cohorte_id')) {
        $queryStatistics->where('cohorte_id', $request->cohorte_id);
    }
    if ($request->filled('centro_id')) {
        $queryStatistics->where('centro_id', $request->centro_id);
    }
    if ($request->filled('periodo_id')) {
        $queryStatistics->where('periodo_id', $request->periodo_id);
    }
    if ($request->filled('status_pay')) {
        $queryStatistics->where('status_pay', $request->status_pay);
    }
    if ($request->filled('status_curso')) {
        $queryStatistics->where('status_curso', $request->status_curso);
    }
    if ($request->filled('genero_id')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('genero_id', $request->genero_id);
        });
    }
    if ($request->filled('es_patrocinado')) {
        $queryStatistics->where('es_patrocinado', filter_var($request->es_patrocinado, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE));
    }
    
    if ($request->filled('patrocinante_id')) {
        $queryStatistics->where('patrocinante_id', $request->patrocinante_id);
    }
    if ($request->filled('patrocinante_id2')) {
        $queryStatistics->where('patrocinante_id2', $request->patrocinante_id2);
    }
    if ($request->filled('patrocinante_id3')) {
        $queryStatistics->where('patrocinante_id3', $request->patrocinante_id3);
    }
    if ($request->filled('fecha_inscripcion')) {
        $queryStatistics->where('fecha_inscripcion', '>=', $request->fecha_inscripcion);
    }
    
    if ($request->filled('procedencia_id')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('procedencia_id', $request->procedencia_id);
        });
    }
    if ($request->filled('nivel_instruccion_id')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('nivel_instruccion_id', $request->nivel_instruccion_id);
        });
    }
    if ($request->filled('estado_id')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('estado_id', $request->estado_id);
        });
    }
   
    if ($request->filled('cedula_identidad')) { 
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('cedula_identidad', 'ILIKE', "%{$request->cedula_identidad}%");
        });
    }
    if ($request->filled('nombres')) { 
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('nombres', 'ILIKE', "%{$request->nombres}%");
        });
    }
    if ($request->filled('apellidos')) { 
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('apellidos', 'ILIKE', "%{$request->apellidos}%");
        });
    }

    // Si en el request se envía 'tlf' con valor 'true', filtrar por registros donde telefono_celular no sea nulo
    if ($request->filled('tlf')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            if ($request->tlf === 'true') {
                $query->whereNotNull('telefono_celular'); // Filtrar registros con teléfono no nulo
            } elseif ($request->tlf === 'false') {
                $query->whereNull('telefono_celular'); // Filtrar registros con teléfono nulo
            }
        });
    }
    if ($request->filled('centro_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('centro_id', $request->centro_id);
        });
    }
    if ($request->filled('grupo_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('grupo_id', $request->grupo_id);
        });
    }
    if ($request->filled('area_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('area_id', $request->area_id);
        });
    }
    if ($request->filled('unidad_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('unidad_id', $request->unidad_id);
        });
    }


    // Obtener todos los datos filtrados para estadísticas
    $datosParaEstadisticas = $queryStatistics->get();

    // Calcular estadísticas generales
    $totalInscritos = $datosParaEstadisticas->count();
    $edades = $datosParaEstadisticas->pluck('datosIdentificacion.edad')->filter();

    $menorEdad = $edades->min();
    $mayorEdad = $edades->max();
    $promedioEdad = $edades->average();

    // Definir nombres para estados de pagos
    $nombresEstadoPagos = [
        1 => 'No pagado (Rojo)',
        2 => 'En proceso (Naranja)',
        3 => 'Pagado (Verde)',
        4 => 'Patrocinado (Azul)',
        5 => 'Exonerado (Rosado)'
    ];

    // Conteo por estado de pagos con nombres
    $estadoPagos = [];
    foreach ($nombresEstadoPagos as $key => $name) {
        $count = $datosParaEstadisticas->where('status_pay', $key)->count();
        $estadoPagos[] = [
            'nombre' => $name,
            'cantidad' => $count
        ];
    }

    // Definir nombres para estados de curso
    $nombresEstadoCursos = [
        1 => 'No finalizado',
        2 => 'Egresado/Certificado',
        3 => 'Retirado'
    ];

    // Conteo por estado de curso con nombres
    $estadoCursos = [];
    foreach ($nombresEstadoCursos as $key => $name) {
        $count = $datosParaEstadisticas->where('status_curso', $key)->count();
        $estadoCursos[] = [
            'nombre' => $name,
            'cantidad' => $count
        ];
    }

// Contar géneros respetando la relación `datosIdentificacion`
$totalMasculino = $datosParaEstadisticas->filter(function ($item) {
    return optional($item->datosIdentificacion)->genero_id == 1;
})->count();

$totalFemenino = $datosParaEstadisticas->filter(function ($item) {
    return optional($item->datosIdentificacion)->genero_id == 3;
})->count();

$totalOtros = $datosParaEstadisticas->filter(function ($item) {
    return optional($item->datosIdentificacion)->genero_id == 2;
})->count();

// Calcular porcentajes
$porcentajeMasculino = $totalInscritos > 0 ? ($totalMasculino / $totalInscritos) * 100 : 0;
$porcentajeFemenino = $totalInscritos > 0 ? ($totalFemenino / $totalInscritos) * 100 : 0;
$porcentajeOtros = $totalInscritos > 0 ? ($totalOtros / $totalInscritos) * 100 : 0;
// Contar inscritos que realizan aporte
$inscritosAporte = $datosParaEstadisticas->where('realiza_aporte', true)->count();

// Contar inscritos que son patrocinados
$inscritosPatrocinados = $datosParaEstadisticas->where('es_patrocinado', true)->count();

$participantesPorEstado = $datosParaEstadisticas->groupBy('datosIdentificacion.estado.descripcion')->map(function ($group) use ($totalInscritos) {
    $count = $group->count();
    return [
        'count' => $count,
        'percentage' => $totalInscritos > 0 ? ($count / $totalInscritos) * 100 : 0
    ];
});

$cursosPorArea = $datosParaEstadisticas->groupBy('curso.area.descripcion')->map(function ($group) use ($totalInscritos) {
    $count = $group->count();
    return [
        'count' => $count,
        'percentage' => $totalInscritos > 0 ? ($count / $totalInscritos) * 100 : 0
    ];
});



    // Retornar los datos paginados y estadísticas
    return response()->json([
        'datos' => $datosPaginados,
        'estadisticas' => [
            'totalInscritos' => $totalInscritos,
            'menorEdad' => $menorEdad,
            'mayorEdad' => $mayorEdad,
            'promedioEdad' => $promedioEdad,
            'estadoPagos' => $estadoPagos,
            'estadoCursos' => $estadoCursos,
            'porcentajesGenero' => [
                'masculino' => $porcentajeMasculino,
                'femenino' => $porcentajeFemenino,
                'otros' => $porcentajeOtros,
            ],
            'inscritosAporte' => $inscritosAporte,
                'inscritosPatrocinados' => $inscritosPatrocinados,
            'participantesPorEstado' => $participantesPorEstado,    
            'cursosPorArea' => $cursosPorArea,
        ],
        
    ]);
}


public function getIndicadoresWithStatisticsPrint(Request $request)
{
  

    // Consulta para estadísticas (sin paginación)
    $queryStatistics = InformacionInscripcion::query()
    ->with(['centro', 'periodo', 'cohorte', 'datosIdentificacion','curso','datosIdentificacion.procedencia','datosIdentificacion.estado','curso.grupo'])
    ->orderBy('id', 'desc'); // Ordenar por ID descendente
     // Aplicar filtros adicionales 
     if ($request->filled('cohorte_id')) {
        $queryStatistics->where('cohorte_id', $request->cohorte_id);
    }
    if ($request->filled('centro_id')) {
        $queryStatistics->where('centro_id', $request->centro_id);
    }
    if ($request->filled('periodo_id')) {
        $queryStatistics->where('periodo_id', $request->periodo_id);
    }
    if ($request->filled('status_pay')) {
        $queryStatistics->where('status_pay', $request->status_pay);
    }
    if ($request->filled('status_curso')) {
        $queryStatistics->where('status_curso', $request->status_curso);
    }
    if ($request->filled('genero_id')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('genero_id', $request->genero_id);
        });
    }
    if ($request->filled('es_patrocinado')) {
        $queryStatistics->where('es_patrocinado', filter_var($request->es_patrocinado, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE));
    }
    
    if ($request->filled('patrocinante_id')) {
        $queryStatistics->where('patrocinante_id', $request->patrocinante_id);
    }
    if ($request->filled('patrocinante_id2')) {
        $queryStatistics->where('patrocinante_id2', $request->patrocinante_id2);
    }
    if ($request->filled('patrocinante_id3')) {
        $queryStatistics->where('patrocinante_id3', $request->patrocinante_id3);
    }
    if ($request->filled('fecha_inscripcion')) {
        $queryStatistics->where('fecha_inscripcion', '>=', $request->fecha_inscripcion);
    }
    
    if ($request->filled('procedencia_id')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('procedencia_id', $request->procedencia_id);
        });
    }
    if ($request->filled('nivel_instruccion_id')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('nivel_instruccion_id', $request->nivel_instruccion_id);
        });
    }
    if ($request->filled('estado_id')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('estado_id', $request->estado_id);
        });
    }
   
    if ($request->filled('cedula_identidad')) { 
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('cedula_identidad', 'ILIKE', "%{$request->cedula_identidad}%");
        });
    }
    if ($request->filled('nombres')) { 
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('nombres', 'ILIKE', "%{$request->nombres}%");
        });
    }
    if ($request->filled('apellidos')) { 
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('apellidos', 'ILIKE', "%{$request->apellidos}%");
        });
    }

    // Si en el request se envía 'tlf' con valor 'true', filtrar por registros donde telefono_celular no sea nulo
    if ($request->filled('tlf')) {
        $queryStatistics->whereHas('datosIdentificacion', function ($query) use ($request) {
            if ($request->tlf === 'true') {
                $query->whereNotNull('telefono_celular'); // Filtrar registros con teléfono no nulo
            } elseif ($request->tlf === 'false') {
                $query->whereNull('telefono_celular'); // Filtrar registros con teléfono nulo
            }
        });
    }
    if ($request->filled('centro_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('centro_id', $request->centro_id);
        });
    }
    if ($request->filled('grupo_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('grupo_id', $request->grupo_id);
        });
    }
    if ($request->filled('area_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('area_id', $request->area_id);
        });
    }
    if ($request->filled('unidad_id')) {
        $queryStatistics->whereHas('curso', function ($query) use ($request) {
            $query->where('unidad_id', $request->unidad_id);
        });
    }

    // Obtener todos los datos filtrados para las estadísticas sin paginación
    $datosParaEstadisticas = $queryStatistics->with(['centro', 'periodo', 'cohorte', 'datosIdentificacion','curso','datosIdentificacion.procedencia','datosIdentificacion.estado','curso.grupo'])->get();

    // Calcular estadísticas generales
    $totalInscritos = $datosParaEstadisticas->count();
    $edades = $datosParaEstadisticas->pluck('datosIdentificacion.edad')->filter();

    $menorEdad = $edades->min();
    $mayorEdad = $edades->max();
    $promedioEdad = $edades->average();

    // Definir nombres para estados de pagos
    $nombresEstadoPagos = [
        1 => 'No pagado (Rojo)',
        2 => 'En proceso (Naranja)',
        3 => 'Pagado (Verde)',
        4 => 'Patrocinado (Azul)',
        5 => 'Exonerado (Rosado)'
    ];

    // Conteo por estado de pagos con nombres
    $estadoPagos = [];
    foreach ($nombresEstadoPagos as $key => $name) {
        $count = $datosParaEstadisticas->where('status_pay', $key)->count();
        $estadoPagos[] = [
            'nombre' => $name,
            'cantidad' => $count
        ];
    }

    // Definir nombres para estados de curso
    $nombresEstadoCursos = [
        1 => 'No finalizado',
        2 => 'Egresado/Certificado',
        3 => 'Retirado'
    ];

    // Conteo por estado de curso con nombres
    $estadoCursos = [];
    foreach ($nombresEstadoCursos as $key => $name) {
        $count = $datosParaEstadisticas->where('status_curso', $key)->count();
        $estadoCursos[] = [
            'nombre' => $name,
            'cantidad' => $count
        ];
    }

// Contar géneros respetando la relación `datosIdentificacion`
$totalMasculino = $datosParaEstadisticas->filter(function ($item) {
    return optional($item->datosIdentificacion)->genero_id == 1;
})->count();

$totalFemenino = $datosParaEstadisticas->filter(function ($item) {
    return optional($item->datosIdentificacion)->genero_id == 3;
})->count();

$totalOtros = $datosParaEstadisticas->filter(function ($item) {
    return optional($item->datosIdentificacion)->genero_id == 2;
})->count();

// Calcular porcentajes
$porcentajeMasculino = $totalInscritos > 0 ? ($totalMasculino / $totalInscritos) * 100 : 0;
$porcentajeFemenino = $totalInscritos > 0 ? ($totalFemenino / $totalInscritos) * 100 : 0;
$porcentajeOtros = $totalInscritos > 0 ? ($totalOtros / $totalInscritos) * 100 : 0;
// Contar inscritos que realizan aporte
$inscritosAporte = $datosParaEstadisticas->where('realiza_aporte', true)->count();

// Contar inscritos que son patrocinados
$inscritosPatrocinados = $datosParaEstadisticas->where('es_patrocinado', true)->count();

$participantesPorEstado = $datosParaEstadisticas->groupBy('datosIdentificacion.estado.descripcion')->map(function ($group) use ($totalInscritos) {
    $count = $group->count();
    return [
        'count' => $count,
        'percentage' => $totalInscritos > 0 ? ($count / $totalInscritos) * 100 : 0
    ];
});

$cursosPorArea = $datosParaEstadisticas->groupBy('curso.area.descripcion')->map(function ($group) use ($totalInscritos) {
    $count = $group->count();
    return [
        'count' => $count,
        'percentage' => $totalInscritos > 0 ? ($count / $totalInscritos) * 100 : 0
    ];
});
$datos = $queryStatistics->get();


    // Retornar los datos paginados y estadísticas
    return response()->json([
        'datos' => $datos,
        'estadisticas' => [
            'totalInscritos' => $totalInscritos,
            'menorEdad' => $menorEdad,
            'mayorEdad' => $mayorEdad,
            'promedioEdad' => $promedioEdad,
            'estadoPagos' => $estadoPagos,
            'estadoCursos' => $estadoCursos,
            'porcentajesGenero' => [
                'masculino' => $porcentajeMasculino,
                'femenino' => $porcentajeFemenino,
                'otros' => $porcentajeOtros,
            ],
            'inscritosAporte' => $inscritosAporte,
                'inscritosPatrocinados' => $inscritosPatrocinados,
            'participantesPorEstado' => $participantesPorEstado,    
            'cursosPorArea' => $cursosPorArea,
        ],
        
    ]);
}






}
