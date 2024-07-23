<?php

namespace App\Http\Controllers;

use App\Models\DatosIdentificacion;
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
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatosIdentificacionController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = DatosIdentificacion::class;

    public function index()
    {
        $datos = DatosIdentificacion::with('statusSeleccion')->get(['cedula_identidad', 'nombres', 'apellidos', 'status_seleccion_id']);
        return view('datos.index', compact('datos'));
    }

    public function create()
    {
        $statusSeleccion = StatusSeleccion::all();
        $nacionalidades = Nacionalidad::all();
        $generos = Genero::all();
        $gruposPrioritarios = GrupoPrioritario::all();
        $estados = Estado::all();
        $procedencias = Procedencia::all();
        $nivelesInstruccion = NivelInstruccion::all();
        $comoEnteroSuperatec = ComoEnteroSuperatec::all();
        $cohortes = Cohorte::all();
        $centros = Centro::all();
        $periodos = Periodo::all();
        $areas = Area::all();
        $unidades = Unidad::all();
        $modalidades = Modalidad::all();
        $niveles = Nivel::all();
        $tiposPrograma = TipoPrograma::all();

        // Calcular el último número de documento
        $ultimoNumeroDocumento = DatosIdentificacion::max('nro_documento') + 1;

        return view('datos.formulario', compact(
            'statusSeleccion',
            'nacionalidades',
            'generos',
            'gruposPrioritarios',
            'estados',
            'procedencias',
            'nivelesInstruccion',
            'comoEnteroSuperatec',
            'cohortes',
            'centros',
            'periodos',
            'areas',
            'unidades',
            'modalidades',
            'niveles',
            'tiposPrograma',
            'ultimoNumeroDocumento'
        ));
    }

    public function store(Request $request)
    {
        $validatedDatos = $request->validate([
            'cedula_identidad' => 'required|string|max:20|unique:datos_identificacion',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'fecha_nacimiento' => 'required|date',
            'edad' => 'required|integer',
            'direccion' => 'required|string',
            'direccion_email' => 'required|email|max:100',
            'telefono_casa' => 'nullable|string|max:20',
            'telefono_celular' => 'nullable|string|max:20',
            'status_seleccion_id' => 'required|integer|exists:status_seleccion,id',
            'nacionalidad_id' => 'required|integer|exists:nacionalidad,id',
            'genero_id' => 'required|integer|exists:genero,id',
            'grupo_prioritario_id' => 'required|integer|exists:grupo_prioritario,id',
            'estado_id' => 'required|integer|exists:estado,id',
            'procedencia_id' => 'required|integer|exists:procedencia,id',
            'nivel_instruccion_id' => 'required|integer|exists:nivel_instruccion,id'
        ]);

        $validatedInscripcion = $request->validate([
            'como_entero_superatec_id' => 'required|integer|exists:como_entero_superatec,id',
            'cohorte_id' => 'required|integer|exists:cohorte,id',
            'centro_id' => 'required|integer|exists:centro,id',
            'periodo_id' => 'required|integer|exists:periodo,id',
            'area_id' => 'required|integer|exists:area,id',
            'unidad_id' => 'required|integer|exists:unidad,id',
            'modalidad_id' => 'required|integer|exists:modalidad,id',
            'nivel_id' => 'required|integer|exists:nivel,id',
            'tipo_programa_id' => 'required|integer|exists:tipo_programa,id',
            'realiza_aporte' => 'required|boolean',
            'es_patrocinado' => 'required|boolean',
            'grupo' => 'nullable|string|max:50',
            'observaciones' => 'nullable|string'
        ]);

        $validatedInscripcion['fecha_inscripcion'] = now(); // Llenar automáticamente la fecha de inscripción

        DB::transaction(function() use ($validatedDatos, $validatedInscripcion) {
            $datosIdentificacion = DatosIdentificacion::create($validatedDatos);
            $validatedInscripcion['cedula_identidad'] = $datosIdentificacion->cedula_identidad;
            InformacionInscripcion::create($validatedInscripcion);
        });

        return redirect()->route('datos.index')->with('success', 'Datos guardados correctamente');
    }

    public function edit($id)
    {
        $dato = DatosIdentificacion::findOrFail($id);
        $statusSeleccion = StatusSeleccion::all();
        $nacionalidades = Nacionalidad::all();
        $generos = Genero::all();
        $gruposPrioritarios = GrupoPrioritario::all();
        $estados = Estado::all();
        $procedencias = Procedencia::all();
        $nivelesInstruccion = NivelInstruccion::all();
        $comoEnteroSuperatec = ComoEnteroSuperatec::all();
        $cohortes = Cohorte::all();
        $centros = Centro::all();
        $periodos = Periodo::all();
        $areas = Area::all();
        $unidades = Unidad::all();
        $modalidades = Modalidad::all();
        $niveles = Nivel::all();
        $tiposPrograma = TipoPrograma::all();

        return view('datos.formulario_edit', compact(
            'dato',
            'statusSeleccion',
            'nacionalidades',
            'generos',
            'gruposPrioritarios',
            'estados',
            'procedencias',
            'nivelesInstruccion',
            'comoEnteroSuperatec',
            'cohortes',
            'centros',
            'periodos',
            'areas',
            'unidades',
            'modalidades',
            'niveles',
            'tiposPrograma'
        ));
    }

    public function update(Request $request, $id)
    {
        $validatedDatos = $request->validate([
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'fecha_nacimiento' => 'required|date',
            'edad' => 'required|integer',
            'direccion' => 'required|string',
            'direccion_email' => 'required|email|max:100',
            'telefono_casa' => 'nullable|string|max:20',
            'telefono_celular' => 'nullable|string|max:20',
            'status_seleccion_id' => 'required|integer|exists:status_seleccion,id',
            'nacionalidad_id' => 'required|integer|exists:nacionalidad,id',
            'genero_id' => 'required|integer|exists:genero,id',
            'grupo_prioritario_id' => 'required|integer|exists:grupo_prioritario,id',
            'estado_id' => 'required|integer|exists:estado,id',
            'procedencia_id' => 'required|integer|exists:procedencia,id',
            'nivel_instruccion_id' => 'required|integer|exists:nivel_instruccion,id'
        ]);

        $validatedInscripcion = $request->validate([
            'como_entero_superatec_id' => 'required|integer|exists:como_entero_superatec,id',
            'cohorte_id' => 'required|integer|exists:cohorte,id',
            'centro_id' => 'required|integer|exists:centro,id',
            'periodo_id' => 'required|integer|exists:periodo,id',
            'area_id' => 'required|integer|exists:area,id',
            'unidad_id' => 'required|integer|exists:unidad,id',
            'modalidad_id' => 'required|integer|exists:modalidad,id',
            'nivel_id' => 'required|integer|exists:nivel,id',
            'tipo_programa_id' => 'required|integer|exists:tipo_programa,id',
            'realiza_aporte' => 'required|boolean',
            'es_patrocinado' => 'required|boolean',
            'grupo' => 'nullable|string|max:50',
            'observaciones' => 'nullable|string'
        ]);

        DB::transaction(function() use ($validatedDatos, $validatedInscripcion, $id) {
            $datosIdentificacion = DatosIdentificacion::findOrFail($id);
            $datosIdentificacion->update($validatedDatos);

            $informacionInscripcion = InformacionInscripcion::where('cedula_identidad', $id)->first();
            $informacionInscripcion->update($validatedInscripcion);
        });

        return redirect()->route('datos.index')->with('success', 'Datos actualizados correctamente');
    }

    public function destroy($id)
    {
        DB::transaction(function() use ($id) {
            $datosIdentificacion = DatosIdentificacion::findOrFail($id);
            $datosIdentificacion->delete();

            $informacionInscripcion = InformacionInscripcion::where('cedula_identidad', $id)->first();
            if ($informacionInscripcion) {
                $informacionInscripcion->delete();
            }
        });

        return redirect()->route('datos.index')->with('success', 'Datos eliminados correctamente');
    }
    public function show($id)
    {
        $dato = DatosIdentificacion::with([
            'statusSeleccion', 'nacionalidad', 'genero', 'grupoPrioritario', 'estado', 'procedencia', 'nivelInstruccion'
        ])->findOrFail($id);
        $inscripcion = InformacionInscripcion::with([
            'comoEnteroSuperatec', 'cohorte', 'centro', 'periodo', 'area', 'unidad', 'modalidad', 'nivel', 'tipoPrograma'
        ])->where('cedula_identidad', $id)->firstOrFail();
    
        return view('datos.show', compact('dato', 'inscripcion'));
    }
    

}
