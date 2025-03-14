<?php
namespace App\Http\Controllers;

use App\Models\HorarioTarde as Model;

class HorarioTardeController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
