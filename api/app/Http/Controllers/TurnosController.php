<?php
namespace App\Http\Controllers;

use App\Models\Turnos as Model;

class TurnosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
