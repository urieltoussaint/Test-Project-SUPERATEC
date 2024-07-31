<?php
namespace App\Http\Controllers;

use App\Models\Nivel as Model;

class NivelController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
