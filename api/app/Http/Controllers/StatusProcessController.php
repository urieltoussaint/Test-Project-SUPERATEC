<?php
namespace App\Http\Controllers;

use App\Models\StatusProcess as Model;

class StatusProcessController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
