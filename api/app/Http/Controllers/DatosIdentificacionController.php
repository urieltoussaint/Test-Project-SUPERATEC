<?php
namespace App\Http\Controllers;

use App\Models\ComoEnteroSuperatec;
use App\Models\DatosIdentificacion as Model;
use App\Models\DatosIdentificacion;
use App\Models\Estado;
use App\Models\Genero;
use App\Models\GrupoPrioritario;
use App\Models\InformacionInscripcion;
use App\Models\NivelInstruccion;
use App\Models\StatusSeleccion;
use Illuminate\Http\Request;

class DatosIdentificacionController extends Controller


{
    use ApiResourceTrait, ApiCrudTrait;
    protected $class = Model::class;


    public function searchByCedula($cedula_identidad)
{
    $dato = DatosIdentificacion::where('cedula_identidad', $cedula_identidad)->first();

    if (!$dato) {
        return response()->json(['message' => 'No se encontró la cédula'], 404);
    }

    return response()->json($dato);
}

public function fetchFilterOptions()
{
   
        $nivelInstruccion = NivelInstruccion::all();
        $generos = Genero::all();
        $estados = Estado::all();
        $superatec = ComoEnteroSuperatec::all();
        $grupo_priotario= GrupoPrioritario::all();
        $status_seleccion= StatusSeleccion::all();

        return response()->json([
            'nivel_instruccion' => $nivelInstruccion,
            'genero' => $generos,
            'estado' => $estados,
            'superatec' => $superatec,
            'grupo_prioritario' =>$grupo_priotario,
            'status_seleccion'=>$status_seleccion,
        ]);
    
}  

    
    
}



