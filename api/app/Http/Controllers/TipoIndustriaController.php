<?php
namespace App\Http\Controllers;

use App\Models\TipoIndustria as Model;

class TipoIndustriaController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


}
