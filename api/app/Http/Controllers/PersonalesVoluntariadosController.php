<?php
namespace App\Http\Controllers;

use App\Models\InformacionVoluntariados;
use App\Models\PersonalesVoluntariados as Model;
use App\Models\PersonalesVoluntariados;
use Illuminate\Http\Request;

class PersonalesVoluntariadosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;

    public function store(Request $request)
    {
        $resource = $this->new(
            $this->class,
            $request
        );
        $informacion_voluntariados = $this->new(
            InformacionVoluntariados::class,
            $request
        );
        return response($resource, 201);
        
    }
    public function getDatos($id) {
        $datos = PersonalesVoluntariados::with('InformacionVoluntariados')->find($id);
        return response()->json($datos);
    }

    public function update($id, Request $request)
    {
        $resource = $this->edit(
            $this->class::findOrFail($id),
            $request

        );

        $datos = PersonalesVoluntariados::with('InformacionVoluntariados')->find($id);

        $informacion_voluntariados = InformacionVoluntariados::where('id', $datos->InformacionVoluntariados->id)->first();
        $newRequest = new Request($request->informacion_voluntariados);
        $update_info_desc = $this->edit(
            $informacion_voluntariados,
            $newRequest
        );



        return response($resource);

    }




}


