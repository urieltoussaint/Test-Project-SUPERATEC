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
    



}
