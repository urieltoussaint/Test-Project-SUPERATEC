<?php
namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Centro;
use App\Models\Cohorte;
use App\Models\Cursos;
use App\Models\DatosIdentificacion;
use App\Models\InscripcionCursos as Model;
use App\Models\InscripcionCursos;
use App\Models\Modalidad;
use App\Models\Nivel;
use App\Models\Periodo;
use App\Models\StatusSeleccion;
use App\Models\TipoPrograma;
use App\Models\Unidad;
use Illuminate\Http\Request;

class InscripcionCursosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


    public function updateStatus(Request $request, $cedula)
    {
        $curso_id = $request->input('curso_id');
        $status_pay = $request->input('status_pay');
    
        // Buscar la inscripción que coincida con la cédula y el curso
        $inscripcion = InscripcionCursos::where('cedula_identidad', $cedula)
            ->where('curso_id', $curso_id)
            ->first();
    
        if ($inscripcion) {
            // Actualizar el status_pay
            $inscripcion->status_pay = $status_pay;
            $inscripcion->save();
    
            return response()->json(['message' => 'Status updated successfully.'], 200);
        }
    
        return response()->json(['error' => 'Inscription not found.'], 404);
    }


    public function SelectInsc()
{
   
        $cohorte = Cohorte::all();
        $centro = Centro::all();
        $periodo = Periodo::all();
        $area = Area::all();
        $tipoPrograma= TipoPrograma::all();
        $unidad = Unidad::all();
        $modalidad = Modalidad::all();
        $nivel = Nivel::all();
        $status_seleccion = StatusSeleccion::all();

       

        return response()->json([
            'cohorte' => $cohorte,
            'centro' => $centro,
            'periodo' => $periodo,
            'area' => $area,
            'tipo_programa' => $tipoPrograma,
            'unidad' => $unidad,
            'modalidad' => $modalidad,
            'nivel' => $nivel,
            'status_seleccion' => $status_seleccion,
            
        ]);
    
}

    

    

}
