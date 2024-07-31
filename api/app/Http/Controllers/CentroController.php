<?php
namespace App\Http\Controllers;

use App\Models\Centro as Model;

class CentroController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
