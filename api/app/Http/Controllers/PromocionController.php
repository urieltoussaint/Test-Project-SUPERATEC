<?php
namespace App\Http\Controllers;

use App\Models\Centro;
use App\Models\Cohorte;
use App\Models\Mencion;
use App\Models\Periodo;
use App\Models\Procedencia;
use App\Models\Promocion as Model;
use App\Models\Promocion;
use Illuminate\Http\Request;

class PromocionController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;



    public function fetchFilterOptions()
    {
       
            $centro = Centro::all();
            $periodo = Periodo::all();
            $cohorte = Cohorte::all();
            $mencion= Mencion::all();
            $procedencia= Procedencia::all();
    
            return response()->json([
                'periodo' => $periodo,
                'centro' => $centro,
                'cohorte' =>$cohorte,
                'mencion'=>$mencion,
                'procedencia'=>$procedencia,
            ]);
        
    } 

    public function getPromocionesWithStatistics(Request $request)
    {
        // 1. Consulta para obtener los datos paginados que se mostrarán en la tabla
        $queryPaginated = Promocion::query()
            ->with([ 'centro', 'periodo', 'cohorte', 'mencion', 'procedencia'])
            ->orderBy('id', 'desc'); // Ordena por id de forma descendente para mostrar los últimos primero
    
        // Aplicar filtros a la consulta paginada
        if ($request->filled('centro_id')) {
            $queryPaginated->where('centro_id', $request->centro_id);
        }
        if ($request->filled('cohorte_id')) {
            $queryPaginated->where('cohorte_id', $request->cohorte_id);
        }
        if ($request->filled('periodo_id')) {
            $queryPaginated->where('periodo_id', $request->periodo_id);
        }
        if ($request->filled('mencion_id')) {
            $queryPaginated->where('mencion_id', $request->mencion_id);
        }
        if ($request->filled('procedencia_id')) {
            $queryPaginated->where('procedencia_id', $request->procedencia_id);
        }
        if ($request->filled('comentarios')) {
            $queryPaginated->where('comentarios', 'ILIKE', "%{$request->comentarios}%");
        }
        
        
        // Obtener los datos paginados para mostrar en la tabla
        $datosPaginados = $queryPaginated->paginate(10);
    
        // 2. Consulta para obtener todos los datos filtrados (sin paginación) para las estadísticas
        $queryStatistics = Promocion::query();
    
        // Aplicar filtros a la consulta para estadísticas
        if ($request->filled('centro_id')) {
            $queryStatistics->where('centro_id', $request->centro_id);
        }
        if ($request->filled('cohorte_id')) {
            $queryStatistics->where('cohorte_id', $request->cohorte_id);
        }
        if ($request->filled('periodo_id')) {
            $queryStatistics->where('periodo_id', $request->periodo_id);
        }
        if ($request->filled('mencion_id')) {
            $queryStatistics->where('mencion_id', $request->mencion_id);
        }
        if ($request->filled('procedencia_id')) {
            $queryStatistics->where('procedencia_id', $request->procedencia_id);
        }
        if ($request->filled('comentarios')) {
            $queryStatistics->where('comentarios', 'LIKE', "%{$request->comentarios}%");
        }
    
        // Obtener todos los datos filtrados para las estadísticas sin paginación
        $datosParaEstadisticas = $queryStatistics->with([ 'centro', 'periodo', 'cohorte', 'mencion', 'procedencia'])->get();
    
        // Calcular estadísticas generales en todos los datos filtrados
        $totalPromociones = $datosParaEstadisticas->count();
    
        // Calcular porcentajes de empresa y persona
        $totalInteresados = $datosParaEstadisticas->sum('estudiantes_interesados');
        $totalAsistentes = $datosParaEstadisticas->sum('estudiantes_asistentes');
    
        
        // Agrupar por mencion, tipoPatrocinante, pais, y estado para estadísticas
        $mencion = $datosParaEstadisticas->groupBy('mencion.descripcion')->map(function ($group) use ($totalPromociones) {
            $count = $group->count();
            return [
                'count' => $count,
                'percentage' => $totalPromociones > 0 ? ($count / $totalPromociones) * 100 : 0
            ];
        });
    
       
        $procedencia = $datosParaEstadisticas->groupBy('procedencia.descripcion')->map(function ($group) use ($totalPromociones) {
            $count = $group->count();
            return [
                'count' => $count,
                'percentage' => $totalPromociones > 0 ? ($count / $totalPromociones) * 100 : 0
            ];
        });
    
        $centro = $datosParaEstadisticas->groupBy('centro.descripcion')->map(function ($group) use ($totalPromociones) {
            $count = $group->count();
            return [
                'count' => $count,
                'percentage' => $totalPromociones > 0 ? ($count / $totalPromociones) * 100 : 0
            ];
        });

        $asistentesVSInteresados = $datosParaEstadisticas->groupBy('comentarios')->map(function ($group) {
            // Sumar el total de asistentes e interesados en cada grupo
            $asistentes = $group->sum('estudiantes_asistentes');
            $interesados = $group->sum('estudiantes_interesados');
        
            return [
                'asistentes' => $asistentes,
                'interesados' => $interesados,
            ];
        });
        
    
        // Retornar los datos paginados y las estadísticas completas
        return response()->json([
            'datos' => $datosPaginados,
            'estadisticas' => [
                'totalPromociones' => $totalPromociones,
                'totalInteresados' => $totalInteresados,
                'totalAsistentes' => $totalAsistentes,
                'asistentesVSInteresados' => $asistentesVSInteresados,
                'mencion' => $mencion,
                'procedencia' => $procedencia,
                'centro' => $centro,
            ],
        ]);
    }

}
