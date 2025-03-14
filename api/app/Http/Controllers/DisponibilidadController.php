<?php
namespace App\Http\Controllers;

use App\Models\Disponibilidad as Model;

class DisponibilidadController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
