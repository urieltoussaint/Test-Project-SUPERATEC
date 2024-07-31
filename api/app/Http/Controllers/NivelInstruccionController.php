<?php
namespace App\Http\Controllers;

use App\Models\NivelInstruccion as Model;

class NivelInstruccionController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
