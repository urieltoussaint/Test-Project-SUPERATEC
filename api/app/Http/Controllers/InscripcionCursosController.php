<?php
namespace App\Http\Controllers;

use App\Models\Cursos;
use App\Models\DatosIdentificacion;
use App\Models\InscripcionCursos as Model;
use App\Models\InscripcionCursos;
use Illuminate\Http\Request;

class InscripcionCursosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


    public function updateStatus(Request $request)
{
    $cedula = $request->input('cedula_identidad');
    $curso_id = $request->input('curso_id');
    $status_pay = $request->input('status_pay');

    // Buscar la inscripción que coincida con la cédula y el curso
    $inscripcion = InscripcionCursos::where('cedula_identidad', $cedula)
        ->where('curso_id', $curso_id)
        ->first();

    if ($inscripcion) {
        // Actualizar el status_pay
        $inscripcion->status_pay = $status_pay;
        $inscripcion->save();

        return response()->json(['message' => 'Status updated successfully.'], 200);
    }

    return response()->json(['error' => 'Inscription not found.'], 404);
}

    

}
