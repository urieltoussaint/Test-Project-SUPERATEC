<?php
namespace App\Http\Controllers;

use App\Models\ComoEnteroSuperatec;
use App\Models\DatosIdentificacion as Model;
use App\Models\DatosIdentificacion;
use App\Models\Estado;
use App\Models\Genero;
use App\Models\GrupoPrioritario;
use App\Models\InformacionInscripcion;
use App\Models\Nacionalidad;
use App\Models\NivelInstruccion;
use App\Models\Procedencia;
use App\Models\StatusSeleccion;
use Illuminate\Http\Request;

class DatosIdentificacionController extends Controller


{
    use ApiResourceTrait, ApiCrudTrait;
    protected $class = Model::class;

    public function searchByCedula1($cedula_identidad)
{
    $dato = DatosIdentificacion::where('cedula_identidad', $cedula_identidad)->first();

    if (!$dato) {
        return response()->json(['message' => 'No se encontró la cédula'], 404);
    }

    return response()->json($dato);
}



    public function searchByCedula2(Request $request)
    {
        $query = $request->input('query');
        
        $datos = DatosIdentificacion::where('cedula_identidad', 'LIKE', "%{$query}%")
            ->select('id', 'cedula_identidad')  // Solo devuelve la cedula e ID en la búsqueda
            ->get();

        if ($datos->isEmpty()) {
            return response()->json([], 404);
        }

        return response()->json($datos);
    }

    public function getDatosByCedula($cedula)
    {
        $dato = DatosIdentificacion::where('cedula_identidad', $cedula)->first();

        if (!$dato) {
            return response()->json(['message' => 'Datos no encontrados'], 404);
        }

        return response()->json($dato);
    }

    

public function fetchFilterOptions()
{
   
        $nivelInstruccion = NivelInstruccion::all();
        $estados = Estado::all();
        $generos = Genero::all();
        $grupo_prioritario= GrupoPrioritario::all();
        $nacionalidad= Nacionalidad::all();
        $procedencia= Procedencia::all();
        $status_seleccion= StatusSeleccion::all();
        $superatec = ComoEnteroSuperatec::all();
       
        
        
        


        return response()->json([
            'nivel_instruccion' => $nivelInstruccion,
            'estado' => $estados,
            'genero' => $generos,
            'grupo_prioritario' =>$grupo_prioritario,
            'nacionalidad'=>$nacionalidad,
            'procedencia'=>$procedencia,
            'status_seleccion'=>$status_seleccion,
            'superatec' => $superatec,
            
            
            
            
        ]);
    
}  

    
    
}



