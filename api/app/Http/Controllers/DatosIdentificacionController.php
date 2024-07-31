<?php
namespace App\Http\Controllers;

use App\Models\DatosIdentificacion as Model;
use App\Models\DatosIdentificacion;
use App\Models\InformacionInscripcion;

class DatosIdentificacionController extends Controller


{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
    
    // public function show($id)
    // {
    //     return $this->showWithRelations(DatosIdentificacion::class, $id, ['estado', 'procedencia', 'nivelInstruccion','nacionalidad','genero','grupoPrioritario']);
    //     //return $this->showWithRelations(InformacionInscripcion::class, $id, ['cohorte','centro','periodo','periodo','area','unidad','modalidad','nivel','tipoPrograma']);

    // }
    
    
}



