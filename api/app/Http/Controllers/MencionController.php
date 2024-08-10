<?php
namespace App\Http\Controllers;

use App\Models\Mencion as Model;

class MencionController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
