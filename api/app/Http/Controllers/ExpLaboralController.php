<?php
namespace App\Http\Controllers;

use App\Models\ExpLaboral as Model;

class ExpLaboralController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
