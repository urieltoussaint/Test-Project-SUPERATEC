<?php

namespace App\Http\Controllers;

use App\Models\DatosIdentificacion;
use App\Models\StatusSeleccion;
use App\Models\Nacionalidad;
use App\Models\Genero;
use App\Models\GrupoPrioritario;
use App\Models\Estado;
use App\Models\Procedencia;
use App\Models\NivelInstruccion;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DatosIdentificacionController extends Controller
{
    use ApiResourceTrait,
        ApiCrudTrait;

    protected $class = DatosIdentificacion::class;

    public function create()
    {
        $statusSeleccion = StatusSeleccion::all();
        $nacionalidades = Nacionalidad::all();
        $generos = Genero::all();
        $gruposPrioritarios = GrupoPrioritario::all();
        $estados = Estado::all();
        $procedencias = Procedencia::all();
        $nivelesInstruccion = NivelInstruccion::all();

        return view('formulario', compact(
            'statusSeleccion',
            'nacionalidades',
            'generos',
            'gruposPrioritarios',
            'estados',
            'procedencias',
            'nivelesInstruccion'
        ));
    }
}


