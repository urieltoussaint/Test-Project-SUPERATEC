<?php
namespace App\Http\Controllers;

use App\Models\Pais as Model;

class PaisController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
