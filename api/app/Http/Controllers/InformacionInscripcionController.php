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


    public function SelectInsc()
    {
       
            $cohorte = Cohorte::all();
            $centro = Centro::all();
            $periodo = Periodo::all();
            $area = Area::all();
            $tipoPrograma= TipoPrograma::all();
            $unidad = Unidad::all();
            $modalidad = Modalidad::all();
            $nivel = Nivel::all();
           
    
            return response()->json([
                'cohorte' => $cohorte,
                'centro' => $centro,
                'periodo' => $periodo,
                'area' => $area,
                'tipo_programa' => $tipoPrograma,
                'unidad' => $unidad,
                'modalidad' => $modalidad,
                'nivel' => $nivel,
                
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
        ->where('curso_id', $cursoId)
        ->where('cedula_identidad', $cedulaIdentidad)
        ->exists();

    // Si la inscripción ya existe, devolver una respuesta indicando que ya está inscrito
    if ($inscripcionExistente) {
        return response()->json(['alreadyRegistered' => true], 200);
    } else {
        return response()->json(['alreadyRegistered' => false], 200);
    }
}

    
    
}
