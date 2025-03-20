<?php
namespace App\Http\Controllers;

use App\Models\Discapacidad;
use App\Models\Disponibilidad;
use App\Models\EstadoCivil;
use App\Models\ExpLaboral;
use App\Models\HorarioMañana;
use App\Models\HorarioTarde;
use App\Models\PartBolsaEmpleo as Model;
use App\Models\PartBolsaEmpleo;
use App\Models\QuienVive;
use App\Models\RolHogar;
use Illuminate\Http\Request;
use Carbon\Carbon;


class PartBolsaEmpleoController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;



    public function SelectBolsa()
{
   
        $estado_civil = EstadoCivil::all();
        $discapacidad = Discapacidad::all();
        $disponibilidad = Disponibilidad::all();
        $exp_laboral=ExpLaboral::all();
        $quien_vive=QuienVive::all();
        $rol_hogar=RolHogar::all();
        $horario_mañana=HorarioMañana::all();
        $horario_tarde=HorarioTarde::all();

  

        return response()->json([
            'estado_civil' => $estado_civil,
            'discapacidad' => $discapacidad,
            'disponibilidad' => $disponibilidad,
            'exp_laboral'=>$exp_laboral,
            'quien_vive'=>$quien_vive,
            'rol_hogar'=>$rol_hogar,
            'horario_mañana'=>$horario_mañana,
            'horario_tarde'=>$horario_tarde,
     
            
        ]);
    
}


public function searchByCedulaInscBolsaEmpleo(Request $request)
{
    $query = $request->input('query');

    // Buscar en InscBolsaEmpleo, relacionando con DatosIdentificacion
    $datos = PartBolsaEmpleo::whereHas('datosIdentificacion', function ($q) use ($query) {
            $q->where('cedula_identidad', 'LIKE', "%{$query}%");
        })
        ->with(['datosIdentificacion:id,cedula_identidad,nombres,apellidos,fecha_nacimiento,genero_id,direccion,direccion_email,nivel_instruccion_id,telefono_celular']) // Traer la info de la relación
        ->get();

    if ($datos->isEmpty()) {
        return response()->json([], 404);
    }

    return response()->json($datos);
}

public function searchCedula(Request $request)
{
    $query = $request->input('query');

    // Buscar en PartBolsaEmpleo, relacionando con DatosIdentificacion
    $datos = PartBolsaEmpleo::whereHas('datosIdentificacion', function ($q) use ($query) {
            $q->where('cedula_identidad', 'LIKE', "%{$query}%");
        })
        ->get();

    if ($datos->isEmpty()) {
        return response()->json([
            'error' => true,
            'message' => 'Participante no está inscrito en la bolsa de empleo'
        ], 404);
    }

    return response()->json([
        'success' => true,
        'message' => 'Participante ya está inscrito en la bolsa de empleo',
        'data' => $datos
    ], 200);
}









public function getStatistics(Request $request)
{
    // 1. Consulta para obtener los datos paginados que se mostrarán en la tabla
    $queryPaginated = PartBolsaEmpleo::query()
        ->with(['datosIdentificacion','datosIdentificacion.nivelInstruccion','datosIdentificacion.genero','datosIdentificacion.estado']) // Incluir la relación
        ->whereHas('datosIdentificacion', function ($q) use ($request) {
            if ($request->filled('nivel_instruccion_id')) {
                $q->where('nivel_instruccion_id', $request->nivel_instruccion_id);
            }
            if ($request->filled('estado_id')) {
                $q->where('estado_id', $request->estado_id);
            }
            if ($request->filled('genero_id')) {
                $q->where('genero_id', $request->genero_id);
            }
            if ($request->filled('cedula_identidad')) {
                $q->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
            }
            if ($request->filled('nombres')) {
                $q->where('nombres', 'ILIKE', "%{$request->nombres}%");
            }
        })
        ->orderBy('id', 'desc') // Ordena por id de forma descendente para mostrar los últimos primero
        ->paginate(9);

    // 2. Consulta para obtener todos los datos filtrados para las estadísticas
    $queryStatistics = PartBolsaEmpleo::query()
        ->with(['datosIdentificacion','datosIdentificacion.nivelInstruccion','datosIdentificacion.genero','datosIdentificacion.estado'])
        ->whereHas('datosIdentificacion', function ($q) use ($request) {
            if ($request->filled('nivel_instruccion_id')) {
                $q->where('nivel_instruccion_id', $request->nivel_instruccion_id);
            }
            if ($request->filled('estado_id')) {
                $q->where('estado_id', $request->estado_id);
            }
            if ($request->filled('genero_id')) {
                $q->where('genero_id', $request->genero_id);
            }
            if ($request->filled('cedula_identidad')) {
                $q->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
            }

            if ($request->filled('nombres')) {
                $q->where('nombres', 'ILIKE', "%{$request->nombres}%");
            }
        })
        ->get();


        // Calcular la edad de cada participante
        $edades = $queryStatistics->map(function ($item) {
            if ($item->datosIdentificacion && $item->datosIdentificacion->fecha_nacimiento) {
                return (int) Carbon::parse($item->datosIdentificacion->fecha_nacimiento)->age; // Convertir explícitamente a int
            }
            return null;
        })->filter(); // Remover valores nulos
        
        

        // Contar total de participantes
        $totalParticipantes = $edades->count();
        
        // Calcular el promedio, mayor y menor edad
        $promedioEdad = $totalParticipantes > 0 ? $edades->avg() : 0;
        $mayorEdad = $totalParticipantes > 0 ? $edades->max() : 0;
        $menorEdad = $totalParticipantes > 0 ? $edades->min() : 0;
        $edadesFiltradas = $edades->filter(fn($edad) => $edad >= 18 && $edad <= 25)->count();
        
      


        $rangoEdades = [
            '6-12' => $edades->filter(fn($edad) => $edad >= 6 && $edad <= 12)->count(),
            '13-17' => $edades->filter(fn($edad) => $edad >= 13 && $edad <= 17)->count(),
            '18-25' => $edades->filter(fn($edad) => $edad >= 18 && $edad <= 25)->count(),
            '26-35' => $edades->filter(fn($edad) => $edad >= 26 && $edad <= 35)->count(),
            'Más de 35' => $edades->filter(fn($edad) => $edad > 35)->count(),
        ];
        
        
      
    // Calcular porcentajes de género (usando datos de DatosIdentificacion)
    $totalMasculino = $queryStatistics->where('datosIdentificacion.genero_id', 1)->count();
    $totalFemenino = $queryStatistics->where('datosIdentificacion.genero_id', 3)->count();
    $totalOtros = $queryStatistics->where('datosIdentificacion.genero_id', 2)->count();
    $porcentajeMasculino = $totalParticipantes > 0 ? ($totalMasculino / $totalParticipantes) * 100 : 0;
    $porcentajeFemenino = $totalParticipantes > 0 ? ($totalFemenino / $totalParticipantes) * 100 : 0;
    $porcentajeOtros = $totalParticipantes > 0 ? ($totalOtros / $totalParticipantes) * 100 : 0;

    // Agrupar y calcular estadísticas adicionales
    $nivelesInstruccion = $queryStatistics->groupBy('datosIdentificacion.nivelInstruccion.descripcion')->map(function ($group) use ($totalParticipantes) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalParticipantes > 0 ? ($count / $totalParticipantes) * 100 : 0
        ];
    });

    $participantesPorEstado = $queryStatistics->groupBy('datosIdentificacion.estado.descripcion')->map(function ($group) use ($totalParticipantes) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalParticipantes > 0 ? ($count / $totalParticipantes) * 100 : 0
        ];
    });

  

    return response()->json([
        'datos' => $queryPaginated,
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
            'participantesPorEstado' => $participantesPorEstado,
            'edades'=>$edades,
            'edadesFiltradas'=>$edadesFiltradas
        ],
    ]);
}

}
