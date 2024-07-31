<?php
namespace App\Http\Controllers;

use App\Models\Periodo as Model;

class PeriodoController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
