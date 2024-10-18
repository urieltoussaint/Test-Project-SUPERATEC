<?php
namespace App\Http\Controllers;

use App\Models\ContactoPatrocinante as Model;

class ContactoPatrocinanteController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
