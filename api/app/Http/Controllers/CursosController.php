<?php
namespace App\Http\Controllers;

use App\Models\Cursos as Model;
use App\Models\InscripcionCursos;

class CursosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;

    public function obtenerCursosPorCedula($cedula)
    {
        // Obtener inscripciones que coincidan con la cédula proporcionada y cargar la relación con cursos
        $inscripciones = InscripcionCursos::where('cedula_identidad', $cedula)
                        ->join('cursos', 'inscripcion_cursos.curso_id', '=', 'cursos.id')
                        ->select('inscripcion_cursos.*', 'cursos.descripcion', 'cursos.costo')
                        ->get();

        // Verificar si no se encontraron inscripciones
        if ($inscripciones->isEmpty()) {
            return response()->json(['error' => 'No se encontraron cursos para la cédula proporcionada'], 404);
        }

        return response()->json($inscripciones);
    }
}

