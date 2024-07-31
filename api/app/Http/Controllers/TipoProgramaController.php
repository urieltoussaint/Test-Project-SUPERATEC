<?php
namespace App\Http\Controllers;

use App\Models\TipoPrograma as Model;

class TipoProgramaController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
