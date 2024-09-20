<?php
namespace App\Http\Controllers;

use App\Models\Peticiones as Model;
use App\Models\Peticiones;
use Illuminate\Http\Request;

class PeticionesController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


}
