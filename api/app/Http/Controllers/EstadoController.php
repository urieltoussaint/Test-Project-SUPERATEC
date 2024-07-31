<?php
namespace App\Http\Controllers;

use App\Models\Estado as Model;

class EstadoController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
