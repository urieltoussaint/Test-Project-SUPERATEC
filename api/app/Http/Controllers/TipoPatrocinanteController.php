<?php
namespace App\Http\Controllers;

use App\Models\TipoPatrocinante as Model;

class TipoPatrocinanteController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
