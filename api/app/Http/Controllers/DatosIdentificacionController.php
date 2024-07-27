<?php
namespace App\Http\Controllers;

use App\Models\DatosIdentificacion as Model;
use App\Models\InformacionInscripcion;
use App\Models\StatusSeleccion;
use App\Models\Nacionalidad;
use App\Models\Genero;
use App\Models\GrupoPrioritario;
use App\Models\Estado;
use App\Models\Procedencia;
use App\Models\NivelInstruccion;
use App\Models\ComoEnteroSuperatec;
use App\Models\Cohorte;
use App\Models\Centro;
use App\Models\Periodo;
use App\Models\Area;
use App\Models\Unidad;
use App\Models\Modalidad;
use App\Models\Nivel;
use App\Models\TipoPrograma;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatosIdentificacionController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;

    // public function index()
    // {
    //     try {
    //         $datos = DatosIdentificacion::with('statusSeleccion')->get(['cedula_identidad', 'nombres', 'apellidos', 'status_seleccion_id']);
    //         return response()->json($datos, 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Error fetching data'], 500);
    //     }
    // }

    // public function create()
    // {
    //     try {
    //         $statusSeleccion = StatusSeleccion::all();
    //         $nacionalidades = Nacionalidad::all();
    //         $generos = Genero::all();
    //         $gruposPrioritarios = GrupoPrioritario::all();
    //         $estados = Estado::all();
    //         $procedencias = Procedencia::all();
    //         $nivelesInstruccion = NivelInstruccion::all();
    //         $comoEnteroSuperatec = ComoEnteroSuperatec::all();
    //         $cohortes = Cohorte::all();
    //         $centros = Centro::all();
    //         $periodos = Periodo::all();
    //         $areas = Area::all();
    //         $unidades = Unidad::all();
    //         $modalidades = Modalidad::all();
    //         $niveles = Nivel::all();
    //         $tiposPrograma = TipoPrograma::all();

    //         $ultimoNumeroDocumento = DatosIdentificacion::max('nro_documento') + 1;
        
    //         return response()->json(compact(
    //             'statusSeleccion', 'nacionalidades', 'generos', 'gruposPrioritarios', 'estados', 'procedencias', 
    //             'nivelesInstruccion', 'comoEnteroSuperatec', 'cohortes', 'centros', 'periodos', 'areas', 
    //             'unidades', 'modalidades', 'niveles', 'tiposPrograma', 'ultimoNumeroDocumento'
    //         ), 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Error fetching data'], 500);
    //     }
    // }

    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'cedula_identidad' => 'required|string|max:20|unique:datos_identificacion',
    //         'nombres' => 'required|string|max:100',
    //         'apellidos' => 'required|string|max:100',
    //         'fecha_nacimiento' => 'required|date',
    //         'edad' => 'required|integer',
    //         'direccion' => 'required|string',
    //         'direccion_email' => 'required|email|max:100',
    //         'telefono_casa' => 'nullable|string|max:20',
    //         'telefono_celular' => 'nullable|string|max:20',
    //         'status_seleccion_id' => 'required|integer|exists:status_seleccion,id',
    //         'nacionalidad_id' => 'required|integer|exists:nacionalidad,id',
    //         'genero_id' => 'required|integer|exists:genero,id',
    //         'grupo_prioritario_id' => 'required|integer|exists:grupo_prioritario,id',
    //         'estado_id' => 'required|integer|exists:estado,id',
    //         'procedencia_id' => 'required|integer|exists:procedencia,id',
    //         'nivel_instruccion_id' => 'required|integer|exists:nivel_instruccion,id',
    //         'como_entero_superatec_id' => 'required|integer|exists:como_entero_superatec,id',
    //         'cohorte_id' => 'required|integer|exists:cohorte,id',
    //         'centro_id' => 'required|integer|exists:centro,id',
    //         'periodo_id' => 'required|integer|exists:periodo,id',
    //         'area_id' => 'required|integer|exists:area,id',
    //         'unidad_id' => 'required|integer|exists:unidad,id',
    //         'modalidad_id' => 'required|integer|exists:modalidad,id',
    //         'nivel_id' => 'required|integer|exists:nivel,id',
    //         'tipo_programa_id' => 'required|integer|exists:tipo_programa,id',
    //         'realiza_aporte' => 'required|boolean',
    //         'es_patrocinado' => 'required|boolean',
    //         'grupo' => 'nullable|string|max:50',
    //         'observaciones' => 'nullable|string'
    //     ]);

    //     $validated['fecha_inscripcion'] = now(); // Llenar automáticamente la fecha de inscripción

    //     try {
    //         DB::transaction(function() use ($validated) {
    //             $datosIdentificacion = DatosIdentificacion::create($validated);
    //             $validated['cedula_identidad'] = $datosIdentificacion->cedula_identidad;
    //             InformacionInscripcion::create($validated);
    //         });
    //         return response()->json(['message' => 'Datos guardados correctamente'], 201);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Error storing data'], 500);
    //     }
    // }

    // public function edit($id)
    // {
    //     try {
    //         $dato = DatosIdentificacion::findOrFail($id);
    //         $statusSeleccion = StatusSeleccion::all();
    //         $nacionalidades = Nacionalidad::all();
    //         $generos = Genero::all();
    //         $gruposPrioritarios = GrupoPrioritario::all();
    //         $estados = Estado::all();
    //         $procedencias = Procedencia::all();
    //         $nivelesInstruccion = NivelInstruccion::all();
    //         $comoEnteroSuperatec = ComoEnteroSuperatec::all();
    //         $cohortes = Cohorte::all();
    //         $centros = Centro::all();
    //         $periodos = Periodo::all();
    //         $areas = Area::all();
    //         $unidades = Unidad::all();
    //         $modalidades = Modalidad::all();
    //         $niveles = Nivel::all();
    //         $tiposPrograma = TipoPrograma::all();
        
    //         return response()->json(compact(
    //             'dato', 'statusSeleccion', 'nacionalidades', 'generos', 'gruposPrioritarios', 'estados', 
    //             'procedencias', 'nivelesInstruccion', 'comoEnteroSuperatec', 'cohortes', 'centros', 'periodos', 
    //             'areas', 'unidades', 'modalidades', 'niveles', 'tiposPrograma'
    //         ), 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Error fetching data'], 500);
    //     }
    // }

    // public function update(Request $request, $id)
    // {
    //     $validated = $request->validate([
    //         'nombres' => 'required|string|max:100',
    //         'apellidos' => 'required|string|max:100',
    //         'fecha_nacimiento' => 'required|date',
    //         'edad' => 'required|integer',
    //         'direccion' => 'required|string',
    //         'direccion_email' => 'required|email|max:100',
    //         'telefono_casa' => 'nullable|string|max:20',
    //         'telefono_celular' => 'nullable|string|max:20',
    //         'status_seleccion_id' => 'required|integer|exists:status_seleccion,id',
    //         'nacionalidad_id' => 'required|integer|exists:nacionalidad,id',
    //         'genero_id' => 'required|integer|exists:genero,id',
    //         'grupo_prioritario_id' => 'required|integer|exists:grupo_prioritario,id',
    //         'estado_id' => 'required|integer|exists:estado,id',
    //         'procedencia_id' => 'required|integer|exists:procedencia,id',
    //         'nivel_instruccion_id' => 'required|integer|exists:nivel_instruccion,id',
    //         'como_entero_superatec_id' => 'required|integer|exists:como_entero_superatec,id',
    //         'cohorte_id' => 'required|integer|exists:cohorte,id',
    //         'centro_id' => 'required|integer|exists:centro,id',
    //         'periodo_id' => 'required|integer|exists:periodo,id',
    //         'area_id' => 'required|integer|exists:area,id',
    //         'unidad_id' => 'required|integer|exists:unidad,id',
    //         'modalidad_id' => 'required|integer|exists:modalidad,id',
    //         'nivel_id' => 'required|integer|exists:nivel,id',
    //         'tipo_programa_id' => 'required|integer|exists:tipo_programa,id',
    //         'realiza_aporte' => 'required|boolean',
    //         'es_patrocinado' => 'required|boolean',
    //         'grupo' => 'nullable|string|max:50',
    //         'observaciones' => 'nullable|string'
    //     ]);

    //     try {
    //         DB::transaction(function() use ($validated, $id) {
    //             $datosIdentificacion = DatosIdentificacion::findOrFail($id);
    //             $datosIdentificacion->update($validated);

    //             $informacionInscripcion = InformacionInscripcion::where('cedula_identidad', $id)->first();
    //             $informacionInscripcion->update($validated);
    //         });
    //         return response()->json(['message' => 'Datos actualizados correctamente'], 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Error updating data'], 500);
    //     }
    // }

    // public function destroy($id)
    // {
    //     try {
    //         DB::transaction(function() use ($id) {
    //             InformacionInscripcion::where('cedula_identidad', $id)->delete();
    //             $datosIdentificacion = DatosIdentificacion::findOrFail($id);
    //             $datosIdentificacion->delete();
    //         });
    //         return response()->json(['message' => 'Datos eliminados correctamente'], 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Error deleting data'], 500);
    //     }
    // }

    // public function show($id)
    // {
    //     try {
    //         $dato = DatosIdentificacion::with([
    //             'statusSeleccion', 'nacionalidad', 'genero', 'grupoPrioritario', 'estado', 'procedencia', 'nivelInstruccion'
    //         ])->findOrFail($id);

    //         $inscripcion = InformacionInscripcion::with([
    //             'comoEnteroSuperatec', 'cohorte', 'centro', 'periodo', 'area', 'unidad', 'modalidad', 'nivel', 'tipoPrograma'
    //         ])->where('cedula_identidad', $id)->firstOrFail();

    //         return response()->json(compact('dato', 'inscripcion'), 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Error fetching data'], 500);
    //     }
    // }
}
