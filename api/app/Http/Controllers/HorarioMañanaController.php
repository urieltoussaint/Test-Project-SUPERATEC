<?php
namespace App\Http\Controllers;

use App\Models\HorarioMañana as Model;

class HorarioMañanaController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
