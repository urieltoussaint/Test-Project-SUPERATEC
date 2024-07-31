<?php
namespace App\Http\Controllers;

use App\Models\GrupoPrioritario as Model;

class GrupoPrioritarioController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
