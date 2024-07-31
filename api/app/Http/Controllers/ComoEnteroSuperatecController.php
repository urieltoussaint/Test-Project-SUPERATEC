<?php
namespace App\Http\Controllers;

use App\Models\ComoEnteroSuperatec as Model;

class ComoEnteroSuperatecController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
