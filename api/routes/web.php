<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
use App\Http\Controllers\DatosIdentificacionController;
use App\Http\Controllers\BcvController;
use App\Models\DatosIdentificacion;

//Route::get('/api/datos', [DatosIdentificacionController::class, 'index']);
//Route::get('/api/datos/{id}', [DatosIdentificacionController::class, 'show']);
//Route::post('/api/datos', [DatosIdentificacionController::class, 'store']);
//Route::put('/api/datos/{id}', [DatosIdentificacionController::class, 'update']);
//Route::delete('/api/datos/{id}', [DatosIdentificacionController::class, 'destroy']);


Route::get('/api/datos', [DatosIdentificacionController::class, 'index'])->name('datos.index');
Route::get('/api/datos/{id}', [DatosIdentificacionController::class, 'show'])->name('datos.show');
Route::post('/api/datos', [DatosIdentificacionController::class, 'store'])->name('datos.store');
Route::put('/api/datos/{id}', [DatosIdentificacionController::class, 'update'])->name('datos.update');
Route::delete('/api/datos/{id}', [DatosIdentificacionController::class, 'destroy'])->name('datos.destroy');
Route::get('/api/datos/{id}/edit', [DatosIdentificacionController::class, 'edit'])->name('datos.edit');
Route::get('/api/formulario/create', [DatosIdentificacionController::class, 'create'])->name('formulario.create');
Route::post('/api/formulario', [DatosIdentificacionController::class, 'store'])->name('formulario.store');
