<?php
namespace App\Http\Controllers;

use App\Models\Cargo as Model;

class CargoController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
