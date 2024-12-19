<?php
namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Cursos as Model;
use App\Models\Cursos;
use App\Models\InformacionInscripcion;
use App\Models\InscripcionCursos;
use App\Models\Modalidad;
use App\Models\Nivel;
use App\Models\TipoPrograma;
use App\Models\Unidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class CursosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


    public function show($id)
    {
        return response()->json(
            $this->find(
                $this->class,
                $id
            )
        );

        $curso = Cursos::find($id);
        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }
    
        return response()->json($curso);
    }




    public function obtenerCursosPorCedula($cedula)
    {
        // Obtener inscripciones que coincidan con la cédula proporcionada en datos_identificacion
        $inscripciones = InformacionInscripcion::query()
            ->join('datos_identificacion', 'informacion_inscripcion.datos_identificacion_id', '=', 'datos_identificacion.id') // Relación con datos_identificacion
            ->join('cursos', 'informacion_inscripcion.curso_id', '=', 'cursos.id') // Relación con cursos
            ->where('datos_identificacion.cedula_identidad', $cedula) // Filtrar por cédula
            ->whereIn('informacion_inscripcion.status_pay', [1, 2]) // Filtrar status_pay (pendiente o en proceso)
            ->select(
                'informacion_inscripcion.*',
                'cursos.descripcion as curso_descripcion',
                'cursos.costo as curso_costo',
                'cursos.cod as curso_cod',
                'cursos.cuotas as curso_cuotas',
                'datos_identificacion.cedula_identidad'
            )
            ->get();
    
        // Verificar si no se encontraron inscripciones con pagos pendientes
        if ($inscripciones->isEmpty()) {
            return response()->json(['error' => 'No hay cursos con pagos pendientes para la cédula proporcionada'], 404);
        }
    
        return response()->json($inscripciones);
    }
    


    public function getFiltrosCursos()
    {
        $nivel = Nivel::all(); 
        $tipoPrograma = TipoPrograma::all(); 
        $modalidad = Modalidad::all(); 
        $area = Area::all(); 
        $unidad = Unidad::all(); 

        return response()->json([
            'nivel' => $nivel,
            'tipo_programa' => $tipoPrograma,
            'modalidad' => $modalidad,
            'area' => $area,
            'unidad' => $unidad,

        ]);
    }


    
    public function getCursosWithStatistics(Request $request)
    {
        // Función para aplicar filtros
        $applyFilters = function ($query) use ($request) {
            if ($request->filled('nivel_id')) {
                $query->where('nivel_id', $request->nivel_id);
            }
            if ($request->filled('modalidad_id')) {
                $query->where('modalidad_id', $request->modalidad_id);
            }
            if ($request->filled('tipo_programa_id')) {
                $query->where('tipo_programa_id', $request->tipo_programa_id);
            }
            if ($request->filled('area_id')) {
                $query->where('area_id', $request->area_id);
            }
            if ($request->filled('unidad_id')) {
                $query->where('unidad_id', $request->unidad_id);
            }
            if ($request->filled('cod')) {
                $query->where('cod', 'LIKE', "%{$request->cod}%");
            }
            if ($request->filled('curso_descripcion')) {
                $query->where('curso_descripcion', 'ILIKE', "%{$request->curso_descripcion}%");
            }
        };
    
        // Obtener los datos paginados para la tabla de cursos (sin duplicar por inscritos)
        $queryPaginated = DB::table('vw_cursos_inscripciones')
        ->select('curso_id', 'cod', 'curso_descripcion', 'cantidad_horas', 'area_id', 'costo', 'cuotas', 'fecha_inicio')
        ->distinct();
        
        $applyFilters($queryPaginated);
        $cursosPaginados = $queryPaginated->paginate(8);
    
        // Obtener el número de inscritos por curso y añadirlo a cada curso en la paginación
        $numInscritosPorCurso = DB::table('vw_cursos_inscripciones')
            ->select('curso_id', DB::raw('COUNT(inscripcion_id) as num_inscritos'));
        
        $applyFilters($numInscritosPorCurso);
        $numInscritosPorCurso = $numInscritosPorCurso->groupBy('curso_id')->pluck('num_inscritos', 'curso_id');
        
        foreach ($cursosPaginados as $curso) {
            $curso->num_inscritos = $numInscritosPorCurso[$curso->curso_id] ?? 0;
        }
    
        // Aplicar filtros en las métricas globales usando una consulta duplicada con filtros
        $filteredStatistics = DB::table('vw_cursos_inscripciones');
        $applyFilters($filteredStatistics);
    
        // Contar cursos únicos y calcular total de horas sin duplicados
        $totalCursos = $filteredStatistics->distinct('curso_id')->count('curso_id');
  
// Calcular el total de horas sumando las horas de cursos únicos (distintos curso_id)
        $totalHoras = $filteredStatistics
            ->select('curso_id', 'cantidad_horas')
            ->distinct('curso_id')  // Asegura seleccionar cada curso_id solo una vez
            ->pluck('cantidad_horas') // Obtiene las horas de cada curso único
            ->sum();  // Suma las horas de los cursos únicos

        $totalCostos = $filteredStatistics->sum(DB::raw('CASE WHEN costo IS NOT NULL THEN costo ELSE 0 END'));
    
        // Calcular el total de inscritos únicos (por cada inscripción) aplicando filtros
        $totalInscritos = $filteredStatistics->distinct('inscripcion_id')->count('inscripcion_id');
    
        $inscritosAporte = (clone $filteredStatistics)->where('realiza_aporte', true)->distinct('inscripcion_id')->count('inscripcion_id');
        $inscritosPatrocinados = (clone $filteredStatistics)->where('es_patrocinado', true)->distinct('inscripcion_id')->count('inscripcion_id');
    
        // Cálculo para los cursos con mayor ingreso usando filtros
        $cursosMayorIngreso = DB::table('vw_cursos_inscripciones')
            ->select('curso_id', 'curso_descripcion', 'costo', DB::raw('SUM(costo) * COUNT(inscripcion_id) as ingresos'))
            ->where('status_pay', 3);
        
        $applyFilters($cursosMayorIngreso);
        $cursosMayorIngreso = $cursosMayorIngreso
            ->groupBy('curso_id', 'curso_descripcion', 'costo')
            ->orderByDesc('ingresos')
            ->limit(5)
            ->get();
    
        // Cursos por área considerando cursos únicos por curso_id
        $cursosPorArea = DB::table('vw_cursos_inscripciones')
            ->join('area', 'vw_cursos_inscripciones.area_id', '=', 'area.id')
            ->select('area.descripcion as area_name', DB::raw('COUNT(DISTINCT vw_cursos_inscripciones.curso_id) as total_cursos'));
        
        $applyFilters($cursosPorArea);
        $cursosPorArea = $cursosPorArea->groupBy('area.descripcion')->pluck('total_cursos', 'area_name');
    
        // Cursos por nivel considerando cursos únicos por curso_id
        $cursosPorNivel = DB::table('vw_cursos_inscripciones')
            ->join('nivel', 'vw_cursos_inscripciones.nivel_id', '=', 'nivel.id')
            ->select('nivel.descripcion as nivel_name', DB::raw('COUNT(DISTINCT vw_cursos_inscripciones.curso_id) as total_cursos'));
        
        $applyFilters($cursosPorNivel);
        $cursosPorNivel = $cursosPorNivel->groupBy('nivel.descripcion')->pluck('total_cursos', 'nivel_name');
    
        // Cursos por unidad considerando cursos únicos por curso_id
        $totalCursosPorUnidad = DB::table('vw_cursos_inscripciones')
            ->join('unidad', 'vw_cursos_inscripciones.unidad_id', '=', 'unidad.id')
            ->select('unidad.descripcion as unidad_name', DB::raw('COUNT(DISTINCT vw_cursos_inscripciones.curso_id) as total_cursos'));
        
        $applyFilters($totalCursosPorUnidad);
        $totalCursosPorUnidad = $totalCursosPorUnidad->groupBy('unidad.descripcion')->pluck('total_cursos', 'unidad_name');
    
        // Cursos por tipo de programa considerando cursos únicos por curso_id
        $cursosPorTipoPrograma = DB::table('vw_cursos_inscripciones')
            ->join('tipo_programa', 'vw_cursos_inscripciones.tipo_programa_id', '=', 'tipo_programa.id')
            ->select('tipo_programa.descripcion as tipo_programa_name', DB::raw('COUNT(DISTINCT vw_cursos_inscripciones.curso_id) as total_cursos'));
        
        $applyFilters($cursosPorTipoPrograma);
        $cursosPorTipoPrograma = $cursosPorTipoPrograma->groupBy('tipo_programa.descripcion')->pluck('total_cursos', 'tipo_programa_name');
    
        // Cursos por modalidad considerando cursos únicos por curso_id
        $cursosPorModalidad = DB::table('vw_cursos_inscripciones')
            ->join('modalidad', 'vw_cursos_inscripciones.modalidad_id', '=', 'modalidad.id')
            ->select('modalidad.descripcion as modalidad_name', DB::raw('COUNT(DISTINCT vw_cursos_inscripciones.curso_id) as total_cursos'));
        
        $applyFilters($cursosPorModalidad);
        $cursosPorModalidad = $cursosPorModalidad->groupBy('modalidad.descripcion')->pluck('total_cursos', 'modalidad_name');
    
        // Cantidad de inscritos por status_pay aplicando filtros
        $inscritosPorStatusPay = DB::table('vw_cursos_inscripciones')
            ->select('status_pay', DB::raw('COUNT(inscripcion_id) as count'));
        
        $applyFilters($inscritosPorStatusPay);
        $inscritosPorStatusPay = $inscritosPorStatusPay->groupBy('status_pay')->pluck('count', 'status_pay');
    
        // Cantidad de inscritos por status_curso aplicando filtros
        $inscritosPorStatusCurso = DB::table('vw_cursos_inscripciones')
            ->select('status_curso', DB::raw('COUNT(inscripcion_id) as count'));
        
        $applyFilters($inscritosPorStatusCurso);
        $inscritosPorStatusCurso = $inscritosPorStatusCurso->groupBy('status_curso')->pluck('count', 'status_curso');
    
        // Retornar los datos
        return response()->json([
            'cursos' => $cursosPaginados,
            'metrics' => [
                'totalCursos' => $totalCursos,
                'totalHoras' => $totalHoras,
                'totalCostos' => $totalCostos,
                'inscritosAporte' => $inscritosAporte,
                'inscritosPatrocinados' => $inscritosPatrocinados,
                'totalInscritos' => $totalInscritos,
                'cursosPorArea' => $cursosPorArea,
                'cursosPorNivel' => $cursosPorNivel,
                'porcentajeCursosPorUnidad' => $totalCursosPorUnidad,
                'cursosPorTipoPrograma' => $cursosPorTipoPrograma,
                'cursosPorModalidad' => $cursosPorModalidad,
                'inscritosPorStatusPay' => $inscritosPorStatusPay,
                'inscritosPorStatusCurso' => $inscritosPorStatusCurso,
                'cursosMayorIngreso' => $cursosMayorIngreso,
            ]
        ]);
    }
    
    
    public function getCursos(Request $request)
    {
        // Función para aplicar filtros
        $applyFilters = function ($query) use ($request) {
            if ($request->filled('nivel_id')) {
                $query->where('nivel_id', $request->nivel_id);
            }
            if ($request->filled('modalidad_id')) {
                $query->where('modalidad_id', $request->modalidad_id);
            }
            if ($request->filled('tipo_programa_id')) {
                $query->where('tipo_programa_id', $request->tipo_programa_id);
            }
            if ($request->filled('area_id')) {
                $query->where('area_id', $request->area_id);
            }
            if ($request->filled('unidad_id')) {
                $query->where('unidad_id', $request->unidad_id);
            }
            if ($request->filled('cod')) {
                $query->where('cod', 'ILIKE', "%{$request->cod}%");
            }
            if ($request->filled('curso_descripcion')) {
                $query->where('curso_descripcion', 'ILIKE', "%{$request->curso_descripcion}%");
            }
        };
    
        // Obtener los datos paginados para la tabla de cursos (sin duplicar por inscritos)
        $queryPaginated = DB::table('vw_cursos_inscripciones')
        ->select('curso_id', 'cod', 'curso_descripcion', 'cantidad_horas', 'area_id', 'costo', 'cuotas', 'fecha_inicio')
        ->distinct();
        
        $applyFilters($queryPaginated);
        $cursosPaginados = $queryPaginated->paginate(8);
        // Retornar los datos
        return response()->json([
            'cursos' => $cursosPaginados,
          
            ]
        );
    }
    
    
    

    
    

    




}

