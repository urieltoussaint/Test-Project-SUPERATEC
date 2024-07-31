<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\CentroController;
use App\Http\Controllers\CohorteController;
use App\Http\Controllers\ComoEnteroSuperatecController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DatosIdentificacionController;
use App\Http\Controllers\EstadoController;
use App\Http\Controllers\GeneroController;
use App\Http\Controllers\GrupoPrioritarioController;
use App\Http\Controllers\ModalidadController;
use App\Http\Controllers\StatusSeleccionController;
use App\Http\Controllers\NacionalidadController;
use App\Http\Controllers\NivelController;
use App\Http\Controllers\NivelInstruccionController;
use App\Http\Controllers\PeriodoController;
use App\Http\Controllers\ProcedenciaController;
use App\Http\Controllers\TipoProgramaController;
use App\Http\Controllers\UnidadController;

// Rutas definidas en routes/api.php

Route::apiResources([
    'datos' => \App\Http\Controllers\DatosIdentificacionController::class,


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

