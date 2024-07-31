<?php
namespace App\Http\Controllers;

use App\Models\Genero as Model;

class GeneroController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
