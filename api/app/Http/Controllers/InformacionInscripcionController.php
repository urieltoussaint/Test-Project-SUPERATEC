<?php

namespace App\Http\Controllers;

use App\Models\InformacionInscripcion;
use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Centro;
use App\Models\Cohorte;
use App\Models\Modalidad;
use App\Models\Nivel;
use App\Models\Periodo;
use App\Models\TipoPrograma;
use App\Models\Unidad;
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

  

        return response()->json([
            'cohorte' => $cohorte,
            'centro' => $centro,
            'periodo' => $periodo,
            'area'=>$area,
            'unidad'=>$unidad,
            'modalidad'=>$modalidad,
            'nivel'=>$nivel,
            'tipoPrograma'=>$tipoPrograma
     
            
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
   
        return response()->json([
            'centro' => $centro,
            'cohorte' =>$cohorte,
            'periodo'=>$periodo,
         
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

    // Aplicar filtros adicionales como en tu código
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
    if ($request->filled('cedula_identidad')) {
        $queryPaginated->whereHas('datosIdentificacion', function ($query) use ($request) {
            $query->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
        });
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




}
