<?php
namespace App\Http\Controllers;

use App\Models\ReportePagos as Model;

class ReportePagosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
}
