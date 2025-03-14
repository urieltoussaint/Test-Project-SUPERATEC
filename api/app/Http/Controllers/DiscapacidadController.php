<?php
namespace App\Http\Controllers;

use App\Models\Discapacidad as Model;

class DiscapacidadController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
