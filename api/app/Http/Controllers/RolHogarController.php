<?php
namespace App\Http\Controllers;

use App\Models\RolHogar as Model;

class RolHogarController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
