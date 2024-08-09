<?php
namespace App\Http\Controllers;

use App\Models\TipoVoluntariado as Model;

class TipoVoluntariadoController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
