<?php
namespace App\Http\Controllers;

use App\Models\Procedencia as Model;
use App\Models\Procedencia;

class ProcedenciaController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


    public function validateCOD($cod)
{
    $cod =Procedencia ::where('cod', $cod)->first();

    if ($cod) {
        return response()->json(['message' => 'cod exists'], 200);
    } else {
        return response()->json(['message' => 'cod not found'], 404);
    }
}

}
