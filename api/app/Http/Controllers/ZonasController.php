<?php
namespace App\Http\Controllers;

use App\Models\Zonas as Model;

class ZonasController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
