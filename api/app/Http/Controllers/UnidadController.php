<?php
namespace App\Http\Controllers;

use App\Models\Unidad as Model;

class UnidadController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
