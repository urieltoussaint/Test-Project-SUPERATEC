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



Route::get('/datos', [DatosIdentificacionController::class, 'index'])->name('datos.index');
Route::get('/formulario', [DatosIdentificacionController::class, 'create'])->name('formulario.create');
Route::post('/formulario', [DatosIdentificacionController::class, 'store'])->name('formulario.store');
Route::get('/datos/{id}/edit', [DatosIdentificacionController::class, 'edit'])->name('datos.edit');
Route::put('/datos/{id}', [DatosIdentificacionController::class, 'update'])->name('datos.update');
Route::delete('/datos/{id}', [DatosIdentificacionController::class, 'destroy'])->name('datos.destroy');
Route::get('/datos/{id}', [DatosIdentificacionController::class, 'show'])->name('datos.show');
Route::get('/precio-bcv', [BcvController::class, 'getPrecioActual']);
Route::get('/test-save-precio', [BcvController::class, 'savePrecioActual']);

