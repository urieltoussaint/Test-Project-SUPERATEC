<?php
namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Cursos as Model;
use App\Models\Cursos;
use App\Models\InformacionInscripcion;
use App\Models\InscripcionCursos;
use App\Models\Modalidad;
use App\Models\Nivel;
use App\Models\TipoPrograma;
use App\Models\Unidad;

class CursosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


    public function show($id)
    {
        return response()->json(
            $this->find(
                $this->class,
                $id
            )
        );

        $curso = Cursos::find($id);
        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }
    
        return response()->json($curso);
    }


    public function obtenerCursosPorCedula($cedula)
    {
        // Obtener inscripciones que coincidan con la cédula proporcionada y cargar la relación con cursos
        $inscripciones = InformacionInscripcion::where('cedula_identidad', $cedula)
                        ->join('cursos', 'informacion_inscripcion.curso_id', '=', 'cursos.id')
                        ->select('informacion_inscripcion.*', 'cursos.descripcion', 'cursos.costo')
                        ->get();

        // Verificar si no se encontraron inscripciones
        if ($inscripciones->isEmpty()) {
            return response()->json(['error' => 'No se encontraron cursos para la cédula proporcionada'], 404);
        }

        return response()->json($inscripciones);
    }

    public function getFiltrosCursos()
    {
        $nivel = Nivel::all(); 
        $tipoPrograma = TipoPrograma::all(); 
        $modalidad = Modalidad::all(); 
        $area = Area::all(); 
        $unidad = Unidad::all(); 

        return response()->json([
            'nivel' => $nivel,
            'tipo_programa' => $tipoPrograma,
            'modalidad' => $modalidad,
            'area' => $area,
            'unidad' => $unidad,

        ]);
    }
}

