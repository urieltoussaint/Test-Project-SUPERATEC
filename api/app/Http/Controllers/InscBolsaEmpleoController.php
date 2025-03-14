<?php
namespace App\Http\Controllers;

use App\Models\InscBolsaEmpleo as Model;
use App\Models\InscBolsaEmpleo;
use Illuminate\Http\Request;

class InscBolsaEmpleoController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;




    public function store(Request $request)
    {
        // Si la solicitud incluye 'participantes', procesarlos primero
        if ($request->has('inscripciones')) {
            $inscripciones = $request->inscripciones;
    
            if (is_array($inscripciones)) {
                // Si es un array, insertar múltiples registros
                $nuevosinscripciones = collect($inscripciones)->map(function ($inscripcion) {
                    return InscBolsaEmpleo::create([
                        'patrocinante_id' => $inscripcion['patrocinante_id'] ?? null,
                        'part_bolsa_empleo_id' => $inscripcion['part_bolsa_empleo_id'] ?? '',
                        'cargo_ofrecido' => $inscripcion['cargo_ofrecido'] ?? '',
                        'email' => $inscripcion['email'] ?? null,
                        'fecha_post' => $inscripcion['fecha_post'] ?? null,
                        
                    ]);
                });
    
                // Convertir la colección a un array de IDs y cédulas
                $inscripcionesConIds = $nuevosinscripciones->map(function ($p) {
                    return [
                        'id' => $p->id,
                    ];
                });
    
                return response()->json([
                    'inscripciones' => $inscripcionesConIds
                ], 201);
            } elseif (is_object($inscripciones)) {
                // Si es un solo objeto, insertarlo individualmente
                return InscBolsaEmpleo::create([
                    'patrocinante_id' => $inscripcion['patrocinante_id'] ?? null,
                    'part_bolsa_empleo_id' => $inscripcion['part_bolsa_empleo_id'] ?? '',
                    'cargo_ofrecido' => $inscripcion['cargo_ofrecido'] ?? '',
                    'email' => $inscripcion['email'] ?? null,
             
                ]);
    
                return response()->json([
                    'inscripciones' => [
                        [
                            'id' => $nuevoInscripcion->id,
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
    

    
public function getStatistics(Request $request)
{
    // 1. Consulta para obtener los datos paginados que se mostrarán en la tabla
    $queryPaginated = InscBolsaEmpleo::query()
        ->with(['PartBolsaEmpleo','PartBolsaEmpleo.datosIdentificacion','Patrocinante']) // Incluir la relación
        ->whereHas('Patrocinante', function ($q) use ($request) {
            
            if ($request->filled('nombre_patrocinante')) {
                $q->where('nombre_patrocinante', 'ILIKE', "%{$request->nombre_patrocinante}%");
            }
        })
        
        ->orderBy('id', 'desc'); // Ordena por id de forma descendente para mostrar los últimos primero

        if ($request->filled('cargo_ofrecido')) {
            $queryPaginated->where('cargo_ofrecido', 'ILIKE', "%{$request->cargo_ofrecido}%");
        }

        $datosPaginados = $queryPaginated->paginate(9);
    // 2. Consulta para obtener todos los datos filtrados para las estadísticas
    $queryStatistics = InscBolsaEmpleo::query()
        ->with(['PartBolsaEmpleo','PartBolsaEmpleo.datosIdentificacion','Patrocinante']) // Incluir la relación
        ->whereHas('Patrocinante', function ($q) use ($request) {
            if ($request->filled('nombre_patrocinante')) {
                $q->where('nombre_patrocinante', 'ILIKE', "%{$request->nombre_patrocinante}%");
            }
        })
        ->orderBy('id', 'desc');

        if ($request->filled('cargo_ofrecido')) {
            $queryStatistics->where('cargo_ofrecido', 'ILIKE', "%{$request->cargo_ofrecido}%");
        }

        $datosEstadisticas = $queryStatistics->get();

        // Contar total de participantes
        $totalPostulaciones = $datosEstadisticas->count();
  
    return response()->json([
        'datos' => $datosPaginados,
        'estadisticas' => [
            'totalPostulaciones' => $totalPostulaciones,
            
        ],
    ]);
}


public function getStatisticsEmpresas(Request $request)
{
    // 1. Consulta para obtener los datos paginados que se mostrarán en la tabla
    $queryPaginated = InscBolsaEmpleo::query()
        ->with(['PartBolsaEmpleo','PartBolsaEmpleo.datosIdentificacion','Patrocinante','PartBolsaEmpleo.datosIdentificacion.nivelInstruccion',
        'PartBolsaEmpleo.datosIdentificacion.genero','PartBolsaEmpleo.datosIdentificacion.estado']) // Incluir la relación
        ->whereHas('PartBolsaEmpleo.datosIdentificacion', function ($q) use ($request) {

            if ($request->filled('cedula_identidad')) {
                $q->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
            }
            if ($request->filled('nombres')) {
                $q->where('nombres', 'ILIKE', "%{$request->nombres}%");
            }
            if ($request->filled('apellidos')) {
                $q->where('apellidos', 'ILIKE', "%{$request->apellidos}%");
            }
            if ($request->filled('nivel_instruccion_id')) {
                $q->where('nivel_instruccion_id', $request->nivel_instruccion_id);
            }
            if ($request->filled('genero_id')) {
                $q->where('genero_id', $request->genero_id);
            }
            if ($request->filled('estado_id')) {
                $q->where('estado_id', $request->estado_id);
            }
           
        })
        ->orderBy('id', 'desc'); // Ordena por id de forma descendente para mostrar los últimos primero

        if ($request->filled('cargo_ofrecido')) {
            $queryPaginated->where('cargo_ofrecido', 'ILIKE', "%{$request->cargo_ofrecido}%");
        }

        $datosPaginados = $queryPaginated->paginate(9);
    // 2. Consulta para obtener todos los datos filtrados para las estadísticas
    $queryStatistics = InscBolsaEmpleo::query()
    ->with(['PartBolsaEmpleo','PartBolsaEmpleo.datosIdentificacion','Patrocinante','PartBolsaEmpleo.datosIdentificacion.nivelInstruccion',
    'PartBolsaEmpleo.datosIdentificacion.genero','PartBolsaEmpleo.datosIdentificacion.estado']) // Incluir la relación
    ->whereHas('PartBolsaEmpleo.datosIdentificacion', function ($q) use ($request) {

        if ($request->filled('cedula_identidad')) {
            $q->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
        }
        if ($request->filled('nombres')) {
            $q->where('nombres', 'ILIKE', "%{$request->nombres}%");
        }
        if ($request->filled('apellidos')) {
            $q->where('apellidos', 'ILIKE', "%{$request->apellidos}%");
        }
        if ($request->filled('nivel_instruccion_id')) {
            $q->where('nivel_instruccion_id', $request->nivel_instruccion_id);
        }
        if ($request->filled('genero_id')) {
            $q->where('genero_id', $request->genero_id);
        }
        if ($request->filled('estado_id')) {
            $q->where('estado_id', $request->estado_id);
        }
       
    })
        ->orderBy('id', 'desc');

        if ($request->filled('cargo_ofrecido')) {
            $queryStatistics->where('cargo_ofrecido', 'ILIKE', "%{$request->cargo_ofrecido}%");
        }

        $datosEstadisticas = $queryStatistics->get();

        // Contar total de participantes
        $totalPostulaciones = $datosEstadisticas->count();
  
    return response()->json([
        'datos' => $datosPaginados,
        'estadisticas' => [
            'totalPostulaciones' => $totalPostulaciones,
            
        ],
    ]);
}


}
