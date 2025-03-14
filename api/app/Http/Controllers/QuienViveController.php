<?php
namespace App\Http\Controllers;

use App\Models\QuienVive as Model;

class QuienViveController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
