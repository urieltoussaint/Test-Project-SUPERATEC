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
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InscripcionCursosController;
use App\Http\Controllers\PeticionesController;
use App\Http\Controllers\PromocionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StatusProcessController;

// Rutas definidas en routes/api.php

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout']);

Route::middleware('auth.token','throttle:400,1')->group(function () {
    // Autenticación
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'index']);

    // Rutas protegidas por rol - Admin tiene todos los permisos, superuser puede crear/editar/ver, invitado solo puede ver.

    //Usuarios
    Route::get('users', [AuthController::class, 'index'])->middleware('role:admin,superuser,invitado'); // 
    Route::post('users', [AuthController::class, 'store'])->middleware('role:admin'); // 
    Route::get('users/{id}', [AuthController::class, 'show'])->middleware('role:admin'); // 
    Route::put('users/{id}', [AuthController::class, 'update'])->middleware('role:admin'); // 
    Route::delete('users/{id}', [AuthController::class, 'destroy'])->middleware('role:admin'); // Solo admin 
    Route::get('users-with-roles', [AuthController::class, 'getAllUsersWithRoles'])->middleware('role:admin,superuser,invitado'); 
    Route::get('role', [RoleController::class, 'index'])->middleware('role:admin,superuser,invitado'); 
    
    // Datos Identificación
    Route::get('datos', [DatosIdentificacionController::class, 'index'])->middleware('role:admin,superuser,invitado'); // Todos pueden ver
    Route::post('datos', [DatosIdentificacionController::class, 'store'])->middleware('role:admin,superuser'); // Solo admin y superuser pueden crear
    Route::get('datos/{id}', [DatosIdentificacionController::class, 'show'])->middleware('role:admin,superuser,invitado'); // Todos pueden ver
    Route::put('datos/{id}', [DatosIdentificacionController::class, 'update'])->middleware('role:admin,superuser'); // Solo admin y superuser pueden editar
    Route::delete('datos/{id}', [DatosIdentificacionController::class, 'destroy'])->middleware('role:admin'); // Solo admin puede eliminar

    // Cursos
    Route::get('cursos', [CursosController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('cursos', [CursosController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('cursos/{id}', [CursosController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::put('cursos/{id}', [CursosController::class, 'update'])->middleware('role:admin,superuser');
    Route::delete('cursos/{id}', [CursosController::class, 'destroy'])->middleware('role:admin');

    // Inscripción Cursos
    Route::get('cursos_inscripcion', [InscripcionCursosController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('cursos_inscripcion', [InscripcionCursosController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('cursos_inscripcion/{id}', [InscripcionCursosController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::put('cursos_inscripcion/{id}', [InscripcionCursosController::class, 'update'])->middleware('role:admin,superuser');
    Route::delete('cursos_inscripcion/{id}', [InscripcionCursosController::class, 'destroy'])->middleware('role:admin');

    // Reporte Pagos
    Route::get('pagos', [ReportePagosController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('pagos', [ReportePagosController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('pagos/{id}', [ReportePagosController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::put('pagos/{id}', [ReportePagosController::class, 'update'])->middleware('role:admin,superuser');
    Route::delete('pagos/{id}', [ReportePagosController::class, 'destroy'])->middleware('role:admin');

    // Tasa BCV
    Route::get('tasa_bcv', [TasaBcvController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('tasa_bcv', [TasaBcvController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('tasa_bcv/{id}', [TasaBcvController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::put('tasa_bcv/{id}', [TasaBcvController::class, 'update'])->middleware('role:admin,superuser');
    Route::delete('tasa_bcv/{id}', [TasaBcvController::class, 'destroy'])->middleware('role:admin');

    // Voluntariados
    Route::get('voluntariados', [PersonalesVoluntariadosController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('voluntariados', [PersonalesVoluntariadosController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('voluntariados/{id}', [PersonalesVoluntariadosController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::put('voluntariados/{id}', [PersonalesVoluntariadosController::class, 'update'])->middleware('role:admin,superuser');
    Route::delete('voluntariados/{id}', [PersonalesVoluntariadosController::class, 'destroy'])->middleware('role:admin');

    // Promoción
    Route::get('promocion', [PromocionController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('promocion', [PromocionController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('promocion/{id}', [PromocionController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::put('promocion/{id}', [PromocionController::class, 'update'])->middleware('role:admin,superuser');
    Route::delete('promocion/{id}', [PromocionController::class, 'destroy'])->middleware('role:admin');

    // Rutas solo para ver (invitado, superuser y admin)
    Route::get('status_seleccion', [StatusSeleccionController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('nacionalidad_seleccion', [NacionalidadController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('area', [AreaController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('centro', [CentroController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('cohorte', [CohorteController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('como_entero_superatec', [ComoEnteroSuperatecController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('estado', [EstadoController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('genero', [GeneroController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('grupo_prioritario', [GrupoPrioritarioController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('modalidad', [ModalidadController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('nacionalidad', [NacionalidadController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('nivel_instruccion', [NivelInstruccionController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('periodo', [PeriodoController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('procedencia', [ProcedenciaController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('tipo_programa', [TipoProgramaController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('unidad', [UnidadController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('nivel', [NivelController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('/identificacion/{cedula}', [DatosIdentificacionController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::get('/cedulas', [DatosIdentificacionController::class, 'searchCedulas'])->middleware('role:admin,superuser,invitado');
    Route::get('cursos_por_cedula/{cedula}', [CursosController::class, 'obtenerCursosPorCedula'])->middleware('role:admin,superuser,invitado');
    Route::get('/ultimo_pago/{inscripcionCursoId}/{cedula}', [ReportePagosController::class, 'obtenerUltimoPago'])->middleware('role:admin,superuser,invitado');
    Route::get('tasa_bcv', [TasaBcvController::class, 'getLatestTasa'])->middleware('role:admin,superuser,invitado');
    Route::get('tasa_bcv/{id}', [TasaBcvController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::get('reporte_pagos_detalle/{id}', [ReportePagosController::class, 'obtenerDetallePago'])->middleware('role:admin,superuser,invitado');
    Route::get('turnos', [TurnosController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('tipo_voluntariado', [TipoVoluntariadoController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('mencion', [MencionController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('status_process', [StatusProcessController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::get('peticiones', [PeticionesController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('peticiones', [PeticionesController::class, 'store'])->middleware('role:admin,superuser,invitado');

});


