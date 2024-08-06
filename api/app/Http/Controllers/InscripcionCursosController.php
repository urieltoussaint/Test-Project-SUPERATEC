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



    

}
