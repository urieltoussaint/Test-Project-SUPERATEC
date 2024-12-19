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
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CargoController;
use App\Http\Controllers\InscripcionCursosController;
use App\Http\Controllers\PaisController;
use App\Http\Controllers\PatrocinanteController;
use App\Http\Controllers\PeticionesController;
use App\Http\Controllers\PromocionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StatusProcessController;
use App\Http\Controllers\TipoIndustriaController;
use App\Http\Controllers\TipoPatrocinanteController;
use App\Http\Controllers\InformacionInscripcionController;
use App\Models\InformacionInscripcion;

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
    Route::get('users', [AuthController::class, 'index'])->middleware('role:admin'); // 
    Route::post('users', [AuthController::class, 'store'])->middleware('role:admin'); // 
    Route::get('users/{id}', [AuthController::class, 'show'])->middleware('role:admin'); // 
    Route::put('users/{id}', [AuthController::class, 'update'])->middleware('role:admin'); // 
    Route::delete('users/{id}', [AuthController::class, 'destroy'])->middleware('role:admin'); // Solo admin 
    Route::get('users-with-roles', [AuthController::class, 'getAllUsersWithRoles'])->middleware('role:admin,superuser,invitado'); 
    Route::get('role', [RoleController::class, 'index'])->middleware('role:admin,superuser,invitado'); 
    Route::get('/validate-username/{username}', [AuthController::class, 'validateUsername'])->middleware('role:admin,superuser,invitado'); 
    Route::get('users-estadisticas', [AuthController::class, 'getUsersWithStatistics'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('users-paginate', [AuthController::class, 'getUsers'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('role-paginate', [RoleController::class, 'getRole'])->middleware('role:admin,superuser,invitado,pagos');

    
    // Datos Identificación
    Route::get('datos', [DatosIdentificacionController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos'); // Todos pueden ver
    Route::post('datos', [DatosIdentificacionController::class, 'store'])->middleware('role:admin,superuser'); // Solo admin y superuser pueden crear
    Route::get('datos/{id}', [DatosIdentificacionController::class, 'show'])->middleware('role:admin,superuser,invitado'); // Todos pueden ver
    Route::put('datos/{id}', [DatosIdentificacionController::class, 'update'])->middleware('role:admin,superuser'); // Solo admin y superuser pueden editar
    Route::delete('datos/{id}', [DatosIdentificacionController::class, 'destroy'])->middleware('role:admin'); // Solo admin puede eliminar
    Route::get('datos/cedula/{cedula_identidad}', [DatosIdentificacionController::class, 'searchByCedula1'])->middleware('role:admin,superuser,invitado');
    Route::get('datos-filtrados', [DatosIdentificacionController::class, 'getDataWithStatistics'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('datos-estadisticas', [DatosIdentificacionController::class, 'getStatistics'])->middleware('role:admin,superuser,invitado,pagos');




    // Cursos
    Route::get('cursos', [CursosController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::post('cursos', [CursosController::class, 'store'])->middleware('role:admin,superuser, pagos');
    Route::get('cursos/{id}', [CursosController::class, 'show'])->middleware('role:admin,superuser,invitad,pagos');
    Route::put('cursos/{id}', [CursosController::class, 'update'])->middleware('role:admin,superuser ,pagos');
    Route::delete('cursos/{id}', [CursosController::class, 'destroy'])->middleware('role:admin');
    Route::get('cursos-estadisticas', [CursosController::class, 'getCursosWithStatistics'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('cursos-paginate', [CursosController::class, 'getCursos'])->middleware('role:admin,superuser,invitado,pagos');

    

    // Inscripción Cursos
    Route::get('cursos_inscripcion/validate', [InformacionInscripcionController::class, 'validarInscripcion'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('cursos_inscripcion', [InformacionInscripcionController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::post('cursos_inscripcion', [InformacionInscripcionController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('cursos_inscripcion/{id}', [InformacionInscripcionController::class, 'show'])->middleware('role:admin,superuser,invitado,pagos');
    Route::delete('cursos_inscripcion/{id}', [InformacionInscripcionController::class, 'destroy'])->middleware('role:admin');
    Route::put('inscripcion_cursos/{id}', [InformacionInscripcionController::class, 'update'])->middleware('role:admin,superuser,pagos');
    Route::put('inscripcion_cursos/{cedula}/status', [InformacionInscripcionController::class, 'updateStatus'])->middleware('role:admin,superuser,pagos');
    Route::get('/cursos/{id}', [CursosController::class, 'show']);
    Route::get('datos/cursos/{cedula_identidad?}', [InformacionInscripcionController::class, 'index']);
    Route::put('informacion_inscripcion/{id}', [InformacionInscripcionController::class, 'update'])->middleware('role:admin,superuser,pagos');
    Route::get('cursos_inscripcion-filtros/{cursoId}/', [InformacionInscripcionController::class, 'getInscripcionesWithStatistics'])->middleware('role:admin,superuser,pagos');




    // Reporte Pagos
    Route::get('pagos', [ReportePagosController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::post('pagos', [ReportePagosController::class, 'store'])->middleware('role:admin,superuser,pagos');
    Route::get('pagos/{id}', [ReportePagosController::class, 'show'])->middleware('role:admin,superuser,invitado,pagos');
    Route::put('pagos/{id}', [ReportePagosController::class, 'update'])->middleware('role:admin,superuser');
    Route::delete('pagos/{id}', [ReportePagosController::class, 'destroy'])->middleware('role:admin');
    Route::get('pagos-estadisticas', [ReportePagosController::class, 'getPagosWithStatistics'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('pagos-inscripcion/{cursoId}', [ReportePagosController::class, 'getPagosByCurso'])->middleware('role:admin,superuser,invitado,pagos');


    // Tasa BCV
    Route::get('tasa_bcv', [TasaBcvController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('tasa_bcv', [TasaBcvController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('tasa_bcv/{id}', [TasaBcvController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::get('/tasa-bcv/get', [TasaBcvController::class, 'getPrecioActual']);
    Route::get('/tasa-bcv/save', [TasaBcvController::class, 'savePrecioActual']);



    // Voluntariados
    Route::get('voluntariados', [PersonalesVoluntariadosController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('voluntariados', [PersonalesVoluntariadosController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('voluntariados/{id}', [PersonalesVoluntariadosController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::put('voluntariados/{id}', [PersonalesVoluntariadosController::class, 'update'])->middleware('role:admin,superuser');
    Route::delete('voluntariados/{id}', [PersonalesVoluntariadosController::class, 'destroy'])->middleware('role:admin');
    Route::get('voluntariados/cedula/{cedula_identidad}', [PersonalesVoluntariadosController::class, 'searchByCedula1'])->middleware('role:admin,superuser,invitado');
    Route::get('voluntariados-estadisticas', [PersonalesVoluntariadosController::class, 'getVoluntariadosWithStatistics'])->middleware('role:admin,superuser,invitado,pagos');


    // Promoción
    Route::get('promocion', [PromocionController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('promocion', [PromocionController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('promocion/{id}', [PromocionController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::put('promocion/{id}', [PromocionController::class, 'update'])->middleware('role:admin,superuser');
    Route::delete('promocion/{id}', [PromocionController::class, 'destroy'])->middleware('role:admin');
    Route::get('promociones-estadisticas', [PromocionController::class, 'getPromocionesWithStatistics'])->middleware('role:admin,superuser,invitado,pagos');

    // Peticiones
    Route::get('peticiones', [PeticionesController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::post('peticiones', [PeticionesController::class, 'store'])->middleware('role:admin,superuser,invitado,pagos');
    Route::put('peticiones/{id}', [PeticionesController::class, 'update'])->middleware('role:admin,superuser,invitado,pagos');
    Route::delete('peticiones/{id}', [PeticionesController::class, 'destroy'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('peticiones-estadisticas', [PeticionesController::class, 'getPeticionesWithStatistics'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('peticionesAtendidas', [PeticionesController::class, 'getPeticionesAtendidas'])->middleware('role:admin,superuser,invitado,pagos');

     // Patrocinantes
     Route::get('patrocinantes', [PatrocinanteController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
     Route::post('patrocinantes', [PatrocinanteController::class, 'store'])->middleware('role:admin,superuser,invitado,pagos');
     Route::put('patrocinantes/{id}', [PatrocinanteController::class, 'update'])->middleware('role:admin,superuser,invitado,pagos');
     Route::delete('patrocinantes/{id}', [PatrocinanteController::class, 'destroy'])->middleware('role:admin,superuser,invitado,pagos');
     Route::get('patrocinantes/rif-cedula/{rif_cedula}', [PatrocinanteController::class, 'searchByRifCedula'])->middleware('role:admin,superuser,invitado');
     Route::get('patrocinantes/{id}', [PatrocinanteController::class, 'show'])->middleware('role:admin,superuser,invitado'); // Todos pueden ver
     Route::get('patrocinantes-estadisticas', [PatrocinanteController::class, 'getPatrocinantesWithStatistics'])->middleware('role:admin,superuser,invitado,pagos');
     Route::get('patrocinantes-paginate', [PatrocinanteController::class, 'getPatrocinantes'])->middleware('role:admin,superuser,invitado,pagos');


    // Procedencia
    Route::get('procedencia', [ProcedenciaController::class, 'index'])->middleware('role:admin,superuser,invitado');
    Route::post('procedencia', [ProcedenciaController::class, 'store'])->middleware('role:admin,superuser');
    Route::get('procedencia/{id}', [ProcedenciaController::class, 'show'])->middleware('role:admin,superuser,invitado');
    Route::put('procedencia/{id}', [ProcedenciaController::class, 'update'])->middleware('role:admin,superuser');
    Route::delete('procedencia/{id}', [ProcedenciaController::class, 'destroy'])->middleware('role:admin');
    Route::get('/validate-cod/{cod}', [ProcedenciaController::class, 'validateCOD'])->middleware('role:admin,superuser,invitado'); 
    Route::get('procedencia-estadisticas', [ProcedenciaController::class, 'getProcedenciasWithStatistics'])->middleware('role:admin,superuser,invitado,pagos');

    // Rutas solo para ver (invitado, superuser y admin)
    Route::get('nacionalidad_seleccion', [NacionalidadController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('area', [AreaController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('centro', [CentroController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('cohorte', [CohorteController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('como_entero_superatec', [ComoEnteroSuperatecController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('estado', [EstadoController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('genero', [GeneroController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('grupo_prioritario', [GrupoPrioritarioController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('modalidad', [ModalidadController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('nacionalidad', [NacionalidadController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('nivel_instruccion', [NivelInstruccionController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('periodo', [PeriodoController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('procedencia', [ProcedenciaController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('tipo_programa', [TipoProgramaController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('unidad', [UnidadController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('nivel', [NivelController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('/identificacion/{cedula}', [DatosIdentificacionController::class, 'show'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('cedulas', [DatosIdentificacionController::class, 'searchByCedula2']);
    Route::get('identificacion/{cedula}', [DatosIdentificacionController::class, 'getDatosByCedula']);
    Route::get('cursos_por_cedula/{cedula}', [CursosController::class, 'obtenerCursosPorCedula'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('/ultimo_pago/{inscripcionCursoId}', [ReportePagosController::class, 'obtenerUltimoPago'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('tasa_bcv', [TasaBcvController::class, 'getLatestTasa'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('tasa_bcv/{id}', [TasaBcvController::class, 'show'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('reporte_pagos_detalle/{id}', [ReportePagosController::class, 'obtenerDetallePago'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('turnos', [TurnosController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('tipo_voluntariado', [TipoVoluntariadoController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('mencion', [MencionController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('status_process', [StatusProcessController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('cargo', [CargoController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('pais', [PaisController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('tipo_industria', [TipoIndustriaController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('tipo_patrocinante', [TipoPatrocinanteController::class, 'index'])->middleware('role:admin,superuser,invitado,pagos');



    //filtros
    Route::get('roles-and-cargos', [RoleController::class, 'getRolesAndCargos'])->middleware('role:admin');
    Route::get('filtros-cursos', [CursosController::class, 'getFiltrosCursos'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('filter-datos', [DatosIdentificacionController::class, 'fetchFilterOptions'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('filter-patrocinantes', [PatrocinanteController::class, 'fetchFilterOptions'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('filter-promocion', [PromocionController::class, 'fetchFilterOptions'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('filter-voluntariados', [PersonalesVoluntariadosController::class, 'fetchFilterOptions'])->middleware('role:admin,superuser,invitado,pagos');
    Route::get('filter-inscripciones', [InformacionInscripcionController::class, 'fetchFilterOptions'])->middleware('role:admin,superuser,invitado,pagos');


    //slect
    Route::get('select-inc', [InformacionInscripcionController::class, 'SelectInsc'])->middleware('role:admin,superuser,invitado,pagos');


    
    
   

});


