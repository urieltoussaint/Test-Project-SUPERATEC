<?php
namespace App\Http\Controllers;

use App\Models\Peticiones as Model;
use App\Models\Peticiones;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PeticionesController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
    public function index(Request $request)
    {
        return response()->json(

            
            $this->list(
                $this->class,
                $request
            )


        );
        
    }

    public function list($modelClass, Request $request)
{
    // Incluimos las relaciones necesarias
    return $modelClass::with(['user', 'zonas', 'userSuccess'])->paginate(20);
}



public function getPeticionesWithStatistics(Request $request)
{
    $userId = $request->user()->id;
    $roleId = $request->user()->role_id;
    $now = Carbon::now();
    $sixtyDaysAgo = $now->copy()->subDays(60);

    // Filtro de estado opcional para la paginación
    $statusFilter = $request->input('status');
    $queryPaginated = DB::table('peticiones')
        ->leftJoin('zonas', 'peticiones.zona_id', '=', 'zonas.id')
        ->leftJoin('users', 'peticiones.user_id', '=', 'users.id')
        ->where(function ($query) use ($userId, $roleId) {
            $query->where('peticiones.destinatario_id', $userId)
                  ->orWhere('peticiones.role_id', $roleId);
        })
        ->where('peticiones.status', false)
        ->whereDate('peticiones.created_at', '>=', $sixtyDaysAgo) // Solo los últimos 60 días para la paginación
        ->orderBy('peticiones.created_at', 'desc')
        ->select(
            'peticiones.*',
            'zonas.name as zona_name',
            'users.username as user_username'
        );

    if ($statusFilter === 'green') {
        $queryPaginated->whereDate('peticiones.created_at', '>=', $now->copy()->subDays(3));
    } elseif ($statusFilter === 'orange') {
        $queryPaginated->whereDate('peticiones.created_at', '>', $now->copy()->subDays(10))
                       ->whereDate('peticiones.created_at', '<=', $now->copy()->subDays(3));
    } elseif ($statusFilter === 'red') {
        $queryPaginated->whereDate('peticiones.created_at', '<', $now->copy()->subDays(10));
    }

    $peticionesPaginadas = $queryPaginated->paginate(10);

    $queryStatistics = DB::table('peticiones')
        ->where(function ($query) use ($userId, $roleId) {
            $query->where('peticiones.destinatario_id', $userId)
                  ->orWhere('peticiones.role_id', $roleId);
        });

    $totalNoAtendidas = $queryStatistics->clone()->where('peticiones.status', false)->count();
    $totalAtendidas = $queryStatistics->clone()->where('peticiones.status', true)->count();

    $totalReciente = $queryStatistics->clone()
        ->where('peticiones.status', false)
        ->whereDate('peticiones.created_at', '>=', $now->copy()->subDays(3))
        ->count();

    $totalUrgente = $queryStatistics->clone()
        ->where('peticiones.status', false)
        ->whereDate('peticiones.created_at', '<', $now->copy()->subDays(3))
        ->whereDate('peticiones.created_at', '>=', $now->copy()->subDays(10))
        ->count();

    $totalCritico = $queryStatistics->clone()
        ->where('peticiones.status', false)
        ->whereDate('peticiones.created_at', '<', $now->copy()->subDays(10))
        ->count();

    // Generación de datos de la gráfica para los últimos 60 días
    $graphData = DB::table('peticiones')
        ->selectRaw('DATE(peticiones.created_at) as date')
        ->selectRaw('COUNT(CASE WHEN peticiones.status = false THEN 1 END) as received')
        ->selectRaw('COUNT(CASE WHEN peticiones.status = true THEN 1 END) as attended')
        ->where(function ($query) use ($userId, $roleId) {
            $query->where('peticiones.destinatario_id', $userId)
                  ->orWhere('peticiones.role_id', $roleId);
        })
        ->whereDate('peticiones.created_at', '>=', $sixtyDaysAgo)
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

    return response()->json([
        'peticiones' => $peticionesPaginadas,
        'estadisticas' => [
            'totalNoAtendidas' => $totalNoAtendidas,
            'totalAtendidas' => $totalAtendidas,
            'clasificacionAntiguedad' => [
                'reciente' => $totalReciente,
                'urgente' => $totalUrgente,
                'critico' => $totalCritico,
            ],
            'graphData' => $graphData // Añade los datos de la gráfica
        ],
    ]);
}


public function getPeticionesAtendidas(Request $request)
{
    $userId = $request->user()->id;
    $roleId = $request->user()->role_id;
    $now = Carbon::now();
    $startDate = null;

    // Parseo de días si el formato es "número + d", por ejemplo "7d"
    if ($request->has('days') && preg_match('/(\d+)d/', $request->input('days'), $matches)) {
        $daysAgo = (int) $matches[1];
        if ($daysAgo > 0) {
            $startDate = $now->copy()->subDays($daysAgo);
        }
    }

    $sixtyDaysAgo = $now->copy()->subDays(60);

    // Consulta para las peticiones atendidas paginadas
    $queryPaginated = DB::table('peticiones')
        ->leftJoin('zonas', 'peticiones.zona_id', '=', 'zonas.id')
        ->leftJoin('users', 'peticiones.user_id', '=', 'users.id')
        ->leftJoin('users as successUser', 'peticiones.user_success', '=', 'successUser.id')
        ->where(function ($query) use ($userId, $roleId) {
            $query->where('peticiones.destinatario_id', $userId)
                  ->orWhere('peticiones.role_id', $roleId);
        })
        ->where('peticiones.status', true) // Solo peticiones atendidas
        ->when($startDate, function ($query) use ($startDate) {
            // Aplica el filtro de `finish_time` solo si `startDate` está definido
            return $query->whereDate('peticiones.finish_time', '>=', $startDate);
        })
        ->orderBy('peticiones.finish_time', 'desc')
        ->select(
            'peticiones.*',
            'zonas.name as zona_name',
            'users.username as user_username',
            'successUser.username as user_success_username' // Nombre del usuario que atendió
        );

    $peticionesPaginadas = $queryPaginated->paginate(10);

    // Consulta para calcular estadísticas globales de peticiones atendidas y no atendidas
    $queryStatistics = DB::table('peticiones')
        ->where(function ($query) use ($userId, $roleId) {
            $query->where('peticiones.destinatario_id', $userId)
                  ->orWhere('peticiones.role_id', $roleId);
        });

    // Cálculo de estadísticas
    $totalNoAtendidas = $queryStatistics->clone()->where('peticiones.status', false)->count();
    $totalAtendidas = $queryStatistics->clone()->where('peticiones.status', true)->count();

    // Generación de datos de la gráfica para los últimos 60 días basados en created_at
    $graphData = DB::table('peticiones')
        ->selectRaw('DATE(peticiones.created_at) as date')
        ->selectRaw('COUNT(CASE WHEN peticiones.status = false THEN 1 END) as received')
        ->selectRaw('COUNT(CASE WHEN peticiones.status = true THEN 1 END) as attended')
        ->where(function ($query) use ($userId, $roleId) {
            $query->where('peticiones.destinatario_id', $userId)
                  ->orWhere('peticiones.role_id', $roleId);
        })
        ->whereDate('peticiones.created_at', '>=', $sixtyDaysAgo)
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

    return response()->json([
        'peticiones' => $peticionesPaginadas,
        'estadisticas' => [
            'totalNoAtendidas' => $totalNoAtendidas,
            'totalAtendidas' => $totalAtendidas,
            'graphData' => $graphData // Datos para la gráfica
        ],
    ]);
}











}
