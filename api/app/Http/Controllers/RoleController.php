<?php
namespace App\Http\Controllers;

use App\Models\Role as Model;

class RoleController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
