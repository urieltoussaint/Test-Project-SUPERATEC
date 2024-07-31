<?php
namespace App\Http\Controllers;

use App\Models\Cohorte as Model;

class CohorteController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
