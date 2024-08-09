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
        $resource = $this->edit(
            $this->class::findOrFail($id),
            $request

        );

        $datos = DatosIdentificacion::with('informacionInscripcion')->find($id);

        $informacion_inscripcion = InformacionInscripcion::where('id', $datos->informacionInscripcion->id)->first();
        $newRequest = new Request($request->informacion_inscripcion);
        $update_info_desc = $this->edit(
            $informacion_inscripcion,
            $newRequest
        );



        return response($resource);

    }

    public function searchCedulas(Request $request)
    {
        $query = $request->input('query');
        $cedulas = DatosIdentificacion::where('cedula_identidad', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get(['cedula_identidad']);

        return response()->json($cedulas);
    }
    
    
    
    
    
}



