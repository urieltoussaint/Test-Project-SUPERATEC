<?php

namespace App\Http\Controllers;

use App\Models\InformacionInscripcion;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InformacionInscripcionController extends Controller
{
    use ApiResourceTrait,
        ApiCrudTrait
    ;

    protected $class = InformacionInscripcion::class;
    public function show($id)
    {
        return $this->showWithRelations(InformacionInscripcion::class, $id, ['cohorte','centro','periodo','periodo','area','unidad','modalidad','nivel','tipoPrograma']);
    }
}
