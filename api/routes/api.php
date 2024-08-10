<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\CentroController;
use App\Http\Controllers\CohorteController;
use App\Http\Controllers\ComoEnteroSuperatecController;
use App\Http\Controllers\CursosController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DatosIdentificacionController;
use App\Http\Controllers\EstadoController;
use App\Http\Controllers\GeneroController;
use App\Http\Controllers\GrupoPrioritarioController;
use App\Http\Controllers\MencionController;
use App\Http\Controllers\ModalidadController;
use App\Http\Controllers\StatusSeleccionController;
use App\Http\Controllers\NacionalidadController;
use App\Http\Controllers\NivelController;
use App\Http\Controllers\NivelInstruccionController;
use App\Http\Controllers\PeriodoController;
use App\Http\Controllers\ProcedenciaController;
use App\Http\Controllers\ReportePagosController;
use App\Http\Controllers\TasaBcvController;
use App\Http\Controllers\PersonalesVoluntariadosController;
use App\Http\Controllers\TipoProgramaController;
use App\Http\Controllers\TipoVoluntariadoController;
use App\Http\Controllers\TurnosController;
use App\Http\Controllers\UnidadController;
use App\Models\TipoVoluntariado;

// Rutas definidas en routes/api.php

Route::apiResources([
    'datos' => \App\Http\Controllers\DatosIdentificacionController::class,
    'cursos' => \App\Http\Controllers\CursosController::class,
    'cursos_inscripcion' => \App\Http\Controllers\InscripcionCursosController::class,
    'pagos' => \App\Http\Controllers\ReportePagosController::class,
    'tasa_bcv' => \App\Http\Controllers\TasaBcvController::class,
    'voluntariados' => \App\Http\Controllers\PersonalesVoluntariadosController::class,
    'promocion' => \App\Http\Controllers\PromocionController::class,



    
    
]);

Route::get('status_seleccion', [StatusSeleccionController::class, 'index']);
Route::get('nacionalidad_seleccion', [NacionalidadController::class, 'index']);
Route::get('area', [AreaController::class, 'index']);
Route::get('centro', [CentroController::class, 'index']);
Route::get('cohorte', [CohorteController::class, 'index']);
Route::get('como_entero_superatec', [ComoEnteroSuperatecController::class, 'index']);
Route::get('estado', [EstadoController::class, 'index']);
Route::get('genero', [GeneroController::class, 'index']);
Route::get('grupo_prioritario', [GrupoPrioritarioController::class, 'index']);
Route::get('modalidad', [ModalidadController::class, 'index']);
Route::get('nacionalidad', [NacionalidadController::class, 'index']);
Route::get('nivel_instruccion', [NivelInstruccionController::class, 'index']);
Route::get('periodo', [PeriodoController::class, 'index']);
Route::get('procedencia', [ProcedenciaController::class, 'index']);
Route::get('tipo_programa', [TipoProgramaController::class, 'index']);
Route::get('unidad', [UnidadController::class, 'index']);
Route::get('nivel', [NivelController::class, 'index']);
Route::get('/identificacion/{cedula}', [DatosIdentificacionController::class, 'show']);
Route::get('/cedulas', [DatosIdentificacionController::class, 'searchCedulas']);
Route::get('cursos_por_cedula/{cedula}', [CursosController::class, 'obtenerCursosPorCedula']);
Route::get('tasa_bcv', [TasaBcvController::class, 'getLatestTasa']);
Route::get('/ultimo_pago/{inscripcionCursoId}/{cedula}', [App\Http\Controllers\ReportePagosController::class, 'obtenerUltimoPago']);
Route::get('tasa_bcv/{id}', [TasaBcvController::class, 'show']);
Route::get('reporte_pagos_detalle/{id}', [ReportePagosController::class, 'obtenerDetallePago']);
Route::get('turnos', [TurnosController::class, 'index']);
Route::get('tipo_voluntariado', [TipoVoluntariadoController::class, 'index']);
Route::get('mencion', [MencionController::class, 'index']);







