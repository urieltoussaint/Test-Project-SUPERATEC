<?php
namespace App\Http\Controllers;

use App\Models\StatusSeleccion as Model;

class StatusSeleccionController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
