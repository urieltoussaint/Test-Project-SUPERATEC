<?php
namespace App\Http\Controllers;

use App\Models\InformacionVoluntariados as Model;
use Illuminate\Http\Request;

class InformacionVoluntariadosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;



    

}
