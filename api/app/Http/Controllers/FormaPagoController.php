<?php
namespace App\Http\Controllers;

use App\Models\FormaPago as Model;

class FormaPagoControler extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
