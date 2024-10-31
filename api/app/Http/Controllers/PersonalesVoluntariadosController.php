<?php
namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Centro;
use App\Models\ComoEnteroSuperatec;
use App\Models\Genero;
use App\Models\InformacionVoluntariados;
use App\Models\Nivel;
use App\Models\NivelInstruccion;
use App\Models\PersonalesVoluntariados as Model;
use App\Models\PersonalesVoluntariados;
use App\Models\Procedencia;
use App\Models\TipoVoluntariado;
use App\Models\Turnos;
use Illuminate\Http\Request;

class PersonalesVoluntariadosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;

    

    public function store(Request $request)
    {
        // Crear primero el Patrocinante
        $personales_voluntariados = $this->new($this->class, $request);

        // Luego crear ContactoPatrocinante y asignar el id del patrocinante
        $informacion_voluntariados = new InformacionVoluntariados($request->all());
        $informacion_voluntariados->voluntariado_id = $personales_voluntariados->id; // Asignar el id del patrocinante recién creado
        $informacion_voluntariados->save();

        // Retornar la respuesta
        return response()->json([
            'personales_voluntariados' => $personales_voluntariados,
            'informacion_voluntariados' => $informacion_voluntariados
        ], 201);
    }
    

    public function getDatos($id) {
        $datos = PersonalesVoluntariados::with('InformacionVoluntariados')->find($id);
        return response()->json($datos);
    }

    public function update($id, Request $request)
    {
        // Editar el patrocinante existente
        $personales_voluntariados = $this->edit($this->class::findOrFail($id), $request);
    
        // Actualizar el contacto vinculado
        $informacion_voluntariados = InformacionVoluntariados::where('voluntariado_id', $personales_voluntariados->id)->first();
        if ($informacion_voluntariados) {
            $informacion_voluntariados->update($request->all());
        }
    
        return response()->json([
            'personales_voluntariados' => $personales_voluntariados,
            'informacion_voluntariados' => $informacion_voluntariados
        ]);
    }


    public function fetchFilterOptions()
    {
            $centro = Centro::all();
            $area = Area::all();
            $nivel = NivelInstruccion::all();
            $genero= Genero::all();
            $procedencia= Procedencia::all();
            $turno=Turnos::all();
            $superatec=ComoEnteroSuperatec::all();
            $tipo=TipoVoluntariado::all();

            return response()->json([
                'area' => $area,
                'centro' => $centro,
                'nivel' =>$nivel,
                'genero'=>$genero,
                'procedencia'=>$procedencia,
                'turno'=>$turno,
                'superatec'=>$superatec,
                'tipo'=>$tipo
            ]);
    } 

}


