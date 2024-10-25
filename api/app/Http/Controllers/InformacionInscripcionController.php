<?php

namespace App\Http\Controllers;

use App\Models\InformacionInscripcion;
use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Centro;
use App\Models\Cohorte;
use App\Models\Modalidad;
use App\Models\Nivel;
use App\Models\Periodo;
use App\Models\TipoPrograma;
use App\Models\Unidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InformacionInscripcionController extends Controller
{
    use ApiResourceTrait,
        ApiCrudTrait
    ;

    protected $class = InformacionInscripcion::class;


public function index(Request $request, $cedula_identidad = null)
{
    // Verificar si cedula_identidad viene como query string o como parámetro de ruta
    $cursoId = $request->query('curso_id');
    $cedulaIdentidad = $cedula_identidad ?? $request->query('cedula_identidad');  // Usar el valor de la URL o de la query string

    // Verificar si se está filtrando por curso_id o cedula_identidad
    $inscripcionesQuery = InformacionInscripcion::query();

    if ($cursoId) {
        $inscripcionesQuery->where('curso_id', $cursoId);
    }
    
    if ($cedulaIdentidad) {
        $inscripcionesQuery->where('cedula_identidad', $cedulaIdentidad);
    }

    // Cargar relaciones y paginar los resultados
    $inscripciones = $inscripcionesQuery->with('datosIdentificacion', 'curso', 'nivel', 'modalidad','area','periodo')->paginate(20);

    return response()->json($inscripciones);
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
           
    
            return response()->json([
                'cohorte' => $cohorte,
                'centro' => $centro,
                'periodo' => $periodo,
                'area' => $area,
                'tipo_programa' => $tipoPrograma,
                'unidad' => $unidad,
                'modalidad' => $modalidad,
                'nivel' => $nivel,
                
            ]);
        
    }


    public function validarInscripcion(Request $request)
{
    // Validar que los parámetros sean correctos
    $request->validate([
        'curso_id' => 'required|integer',
        'cedula_identidad' => 'required|string',
    ]);

    // Obtener los parámetros de la solicitud
    $cursoId = $request->input('curso_id');
    $cedulaIdentidad = $request->input('cedula_identidad');

    // Comprobar si la cédula ya está inscrita en el curso
    $inscripcionExistente = DB::table('informacion_inscripcion')
        ->where('curso_id', $cursoId)
        ->where('cedula_identidad', $cedulaIdentidad)
        ->exists();

    // Si la inscripción ya existe, devolver una respuesta indicando que ya está inscrito
    if ($inscripcionExistente) {
        return response()->json(['alreadyRegistered' => true], 200);
    } else {
        return response()->json(['alreadyRegistered' => false], 200);
    }
}

    
    
}
