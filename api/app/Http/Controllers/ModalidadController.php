<?php
namespace App\Http\Controllers;

use App\Models\Modalidad as Model;

class ModalidadController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
