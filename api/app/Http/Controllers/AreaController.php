<?php
namespace App\Http\Controllers;

use App\Models\Area as Model;

class AreaController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
