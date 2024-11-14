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

    // 1. Consulta Paginada para mostrar en la interfaz (solo peticiones no atendidas)
    $queryPaginated = DB::table('peticiones')
        ->leftJoin('zonas', 'peticiones.zona_id', '=', 'zonas.id') // Unión con la tabla de zonas
        ->leftJoin('users', 'peticiones.user_id', '=', 'users.id') // Unión con la tabla de usuarios
        ->where(function ($query) use ($userId, $roleId) {
            $query->where('peticiones.destinatario_id', $userId)
                  ->orWhere('peticiones.role_id', $roleId); // Agregar prefijo `peticiones.`
        })
        ->where('peticiones.status', false) // Solo no atendidas por defecto, con prefijo `peticiones.`
        ->orderBy('peticiones.created_at', 'desc') // Ordenar por fecha de creación de forma descendente, con prefijo `peticiones.`
        ->select(
            'peticiones.*',
            'zonas.name as zona_name', // Obtener la descripción de la zona
            'users.username as user_username'        // Obtener el username del usuario
        );

    // Paginación
    $peticionesPaginadas = $queryPaginated->paginate(10);

    // 2. Consulta sin paginación para cálculos estadísticos
    $queryStatistics = DB::table('peticiones')
        ->where(function ($query) use ($userId, $roleId) {
            $query->where('peticiones.destinatario_id', $userId)
                  ->orWhere('peticiones.role_id', $roleId); // Agregar prefijo `peticiones.`
        });

    // Calcular total de peticiones atendidas y no atendidas
    $totalNoAtendidas = $queryStatistics->clone()->where('peticiones.status', false)->count(); // Con prefijo `peticiones.`
    $totalAtendidas = $queryStatistics->clone()->where('peticiones.status', true)->count(); // Con prefijo `peticiones.`

    // Calcular clasificación por antigüedad para no atendidas
    $now = Carbon::now();

    $totalReciente = $queryStatistics->clone()
        ->where('peticiones.status', false) // Con prefijo `peticiones.`
        ->whereDate('peticiones.created_at', '>=', $now->copy()->subDays(3)) // Con prefijo `peticiones.`
        ->count();

    $totalUrgente = $queryStatistics->clone()
        ->where('peticiones.status', false) // Con prefijo `peticiones.`
        ->whereDate('peticiones.created_at', '<', $now->copy()->subDays(3)) // Con prefijo `peticiones.`
        ->whereDate('peticiones.created_at', '>=', $now->copy()->subDays(10)) // Con prefijo `peticiones.`
        ->count();

    $totalCritico = $queryStatistics->clone()
        ->where('peticiones.status', false) // Con prefijo `peticiones.`
        ->whereDate('peticiones.created_at', '<', $now->copy()->subDays(10)) // Con prefijo `peticiones.`
        ->count();

    // Retornar datos paginados y estadísticas
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
        ],
    ]);
}




}
