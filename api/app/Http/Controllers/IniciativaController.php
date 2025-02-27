<?php
namespace App\Http\Controllers;

use App\Models\Iniciativa as Model;

class IniciativaController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
