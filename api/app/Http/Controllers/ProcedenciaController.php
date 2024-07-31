<?php
namespace App\Http\Controllers;

use App\Models\Procedencia as Model;

class ProcedenciaController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
