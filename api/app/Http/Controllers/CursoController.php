<?php

namespace App\Http\Controllers;

use App\Models\Cursos as Model;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CursoController extends Controller
{
    use ApiResourceTrait,
        ApiCrudTrait
    ;

    protected $class = Model::class;
}
