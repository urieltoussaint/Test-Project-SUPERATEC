<?php

namespace App\Http\Controllers;

use App\Models\InformacionInscripcion;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InformacionInscripcionController extends Controller
{
    use ApiResourceTrait,
        ApiCrudTrait
    ;

    protected $class = InformacionInscripcion::class;


    // public function updateStatus(Request $request, $cedula)
    // {
    //     $curso_id = $request->input('curso_id');
    //     $status_pay = $request->input('status_pay');
    
    //     // Buscar la inscripción que coincida con la cédula y el curso
    //     $inscripcion = InformacionInscripcion::where('cedula_identidad', $cedula)
    //         ->where('curso_id', $curso_id)
    //         ->first();
    
    //     if ($inscripcion) {
    //         // Actualizar el status_pay
    //         $inscripcion->status_pay = $status_pay;
    //         $inscripcion->save();
    
    //         return response()->json(['message' => 'Status updated successfully.'], 200);
    //     }
    
    //     return response()->json(['error' => 'Inscription not found.'], 404);
    // }


    public function index(Request $request)
    {
        return response()->json(
            $this->list(
                $this->class,
                $request
            )
        );
        $cursoId = $request->query('curso_id');

    if ($cursoId) {
        // Si hay un curso_id, aplicamos el filtro
        $inscripciones = InformacionInscripcion::where('curso_id', $cursoId)
            ->with('DatosIdentificacion') // Relación con los detalles de identificación
            ->paginate(10); // Aquí puedes ajustar la paginación
    } else {
        // Si no hay curso_id, mostramos todas las inscripciones
        $inscripciones = InformacionInscripcion::with('DatosIdentificacion')->paginate(10);
    }

    return response()->json($inscripciones);


    }
    
}
