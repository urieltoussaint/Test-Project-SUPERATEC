<?php
namespace App\Http\Controllers;

use App\Models\Cursos;
use App\Models\DatosIdentificacion;
use App\Models\InscripcionCursos as Model;
use Illuminate\Http\Request;

class InscripcionCursosController extends Controller
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

        $datosIdentificaciones = DatosIdentificacion::all();
        $cursos = Cursos::all();
        return view('inscripcionCursos', compact('datosIdentificaciones', 'cursos'));
        
    }
}
