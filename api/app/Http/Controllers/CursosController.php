<?php
namespace App\Http\Controllers;

use App\Models\Cursos as Model;

class CursosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
