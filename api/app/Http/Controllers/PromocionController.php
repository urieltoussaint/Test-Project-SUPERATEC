<?php
namespace App\Http\Controllers;

use App\Models\Promocion as Model;

class PromocionController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


}
