<?php
namespace App\Http\Controllers;

use App\Models\EstadoCivil as Model;

class EstadoCivilController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
