<?php
namespace App\Http\Controllers;

use App\Models\Nacionalidad as Model;

class NacionalidadController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
