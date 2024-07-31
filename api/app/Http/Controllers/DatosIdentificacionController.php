<?php
namespace App\Http\Controllers;

use App\Models\DatosIdentificacion as Model;
use App\Models\DatosIdentificacion;
use App\Models\InformacionInscripcion;
use Illuminate\Http\Request;

class DatosIdentificacionController extends Controller


{
    use ApiResourceTrait, ApiCrudTrait;
    protected $class = Model::class;

    public function store(Request $request)
    {
        $resource = $this->new(
            $this->class,
            $request
        );
        $informacion_inscripcion = $this->new(
            InformacionInscripcion::class,
            $request
        );
        return response($resource, 201);
        
    }
    public function getDatos($id) {
        $datos = DatosIdentificacion::with('informacionInscripcion')->find($id);
        return response()->json($datos);
    }

    public function update($id, Request $request)
    {
        \Log::info("pene");
        // $resource = $this->edit(
        //     $this->class::findOrFail($id),
        //     $request
        
        // );
        // $info=InformacionInscripcion::where('cedula_identidad',$id)->first();
        // return dd($info);
        // $informacion_inscripcion = $this->edit(
        //     InformacionInscripcion::findOrFail($id),
        //     $request
        //);

        // return response($resource);
    }
    
    
    
    // public function show($id)
    // {
    //     return $this->showWithRelations(DatosIdentificacion::class, $id, ['estado', 'procedencia', 'nivelInstruccion','nacionalidad','genero','grupoPrioritario']);
    //     //return $this->showWithRelations(InformacionInscripcion::class, $id, ['cohorte','centro','periodo','periodo','area','unidad','modalidad','nivel','tipoPrograma']);

    // }
    
    
}



