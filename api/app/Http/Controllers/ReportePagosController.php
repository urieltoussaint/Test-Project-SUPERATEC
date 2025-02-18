<?php
namespace App\Http\Controllers;

use App\Models\Cursos;
use App\Models\InformacionInscripcion;
use App\Models\InscripcionCursos;
use App\Models\ReportePagos as Model;
use App\Models\ReportePagos;
use App\Models\TasaBcv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class ReportePagosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;

    // public function store(Request $request)
    // {
    //     $inscripcionCurso = InformacionInscripcion::find($request->informacion_inscripcion_id);
    //     $cedulaIdentidad = $inscripcionCurso->cedula_identidad;
    //     $cursoId = $inscripcionCurso->curso_id;

    //     // Verificar si ya existe un pago para esta inscripción
    //     $pagoExistente = ReportePagos::where('informacion_inscripcion_id', $request->informacion_inscripcion_id)
    //                          ->orderBy('id', 'desc')
    //                          ->first();

    //     if ($pagoExistente) {
    //         // Si existe un pago previo, usar el monto restante del pago más reciente
    //         $montoTotal = $pagoExistente->monto_restante;
    //     } else {
    //         // Si no hay pagos previos, usar el costo del curso
    //         $curso = Cursos::find($cursoId);
    //         $montoTotal = $curso->costo;
    //     }

    //     $montoCancelado = $request->monto_cancelado;
    //     $montoExonerado = $request->monto_exonerado;
    //     $montoRestante = $montoTotal - $montoCancelado - $montoExonerado;

    //     // Obtener la tasa de conversión más reciente
    //     $tasaBcv = TasaBcv::orderBy('id', 'desc')->first();
    //     $tasa = $tasaBcv ? $tasaBcv->tasa : 1;

    //     $conversionTotal = $montoTotal * $tasa;
    //     $conversionCancelado = $montoCancelado * $tasa;
    //     $conversionExonerado = $montoExonerado * $tasa;
    //     $conversionRestante = $montoRestante * $tasa;

    //     $pago = new ReportePagos([
    //         'informacion_inscripcion_id' => $request->informacion_inscripcion_id,
    //         'monto_total' => $montoTotal,
    //         'monto_cancelado' => $montoCancelado,
    //         'monto_exonerado' => $montoExonerado,
    //         'monto_restante' => $montoRestante,
    //         'tipo_moneda' => $request->tipo_moneda,
    //         'conversion_total' => $conversionTotal,
    //         'conversion_cancelado' => $conversionCancelado,
    //         'conversion_exonerado' => $conversionExonerado,
    //         'conversion_restante' => $conversionRestante,
    //         'tasa_bcv_id' => $tasaBcv->id,
    //         'comentario_cuota' => $request->comentario_cuota 
    //     ]);

    //     $pago->save();

    //     return response()->json($pago, 201);
    // }

    public function obtenerUltimoPago($inscripcionCursoId, )
{
    $ultimoPago = ReportePagos::where('informacion_inscripcion_id', $inscripcionCursoId)
                    ->orderBy('id', 'desc')
                    ->first();

    if ($ultimoPago) {
        return response()->json($ultimoPago);
    }

    $curso = InformacionInscripcion::where('informacion_inscripcion.id', $inscripcionCursoId)
                ->join('cursos', 'informacion_inscripcion.curso_id', '=', 'cursos.id')
                ->select('cursos.costo')
                ->first();

    return response()->json([
        'monto_total' => $curso->costo,
        'monto_restante' => $curso->costo,
    ]);
}

public function obtenerDetallePago($id)
{
    // Obtener el reporte de pago por ID
    $reportePago = ReportePagos::findOrFail($id);

    // Obtener la inscripción del curso relacionada
    $inscripcionCurso = InformacionInscripcion::where('informacion_inscripcion.id', $reportePago->informacion_inscripcion_id)
        ->join('cursos', 'informacion_inscripcion.curso_id', '=', 'cursos.id')
        ->join('datos_identificacion', 'informacion_inscripcion.datos_identificacion_id', '=', 'datos_identificacion.id') // Para obtener la cédula
        ->select(
            'informacion_inscripcion.*', 
            'cursos.descripcion', 
            'cursos.costo_total', 
            'cursos.costo_inscripcion', 
            'cursos.costo_cuotas',
            'datos_identificacion.cedula_identidad' // Cedula desde la relación
        )
        ->first();

    // Obtener la tasa BCV relacionada
    $tasaBcv = TasaBcv::find($reportePago->tasa_bcv_id);

    // Obtener la descripción del tipo de pago
    $tipoPago = DB::table('tipo_pago')
        ->where('id', $reportePago->tipo_pago_id)
        ->value('descripcion');

    // Verificar si no se encontró la inscripción del curso o la tasa BCV
    if (!$inscripcionCurso || !$tasaBcv) {
        return response()->json(['error' => 'Datos no encontrados'], 404);
    }

    // Construir la respuesta con los datos necesarios
    $data = [
        'id' => $reportePago->id,
        'cedula_identidad' => $inscripcionCurso->cedula_identidad, // Se obtiene desde la relación
        'fecha' => $reportePago->fecha,
        'monto_cancelado' => $reportePago->monto_cancelado,
        'monto_total' => $reportePago->monto_total,
        'monto_exonerado' => $reportePago->monto_exonerado,
        'monto_restante_cuota' => $reportePago->monto_restante_cuota,
        'monto_restante_inscripcion' => $reportePago->monto_restante_inscripcion,
        'tipo_moneda' => $reportePago->tipo_moneda,
        'comentario_cuota' => $reportePago->comentario_cuota,
        'informacion_inscripcion_id' => $reportePago->informacion_inscripcion_id,
        'conversion_cancelado' => $reportePago->conversion_cancelado,
        'conversion_restante' => $reportePago->conversion_restante,
        'conversion_total' => $reportePago->conversion_total,
        'conversion_exonerado' => $reportePago->conversion_exonerado,
        'tasa_bcv' => $tasaBcv->tasa,
        'curso_descripcion' => $inscripcionCurso->descripcion,
        'tipo_pago_id' => $tipoPago // Se obtiene desde la relación
    ];

    return response()->json($data);
}


    public function getPagosByCurso(Request $request, $cursoId)
{
    try {
        // Obtener el tipo_pago_id si está presente en la solicitud
        $tipoPagoId = $request->input('tipo_pago_id');

        // Construir la consulta base
        $query = ReportePagos::where('informacion_inscripcion_id', $cursoId);

        // Aplicar el filtro de tipo_pago_id si está presente
        if ($tipoPagoId) {
            $query->where('tipo_pago_id', $tipoPagoId);
        }

        // Obtener todos los pagos filtrados
        $pagos = $query->get();

        // Calcular la cantidad de pagos
        $cantidadPagos = $pagos->count();

        // Obtener el último pago realizado (ordenado por la fecha de creación)
        $ultimoPago = $pagos->sortByDesc('created_at')->first();

        // Retornar la cantidad de pagos y el último pago
        return response()->json([
            'cantidadPagos' => $cantidadPagos,
            'ultimoPago' => $ultimoPago,
        ]);
    } catch (\Exception $e) {
        // Manejo de errores
        return response()->json([
            'error' => 'Error al obtener los pagos: ' . $e->getMessage(),
        ], 500);
    }
}



    public function getPagosWithStatistics(Request $request)
    {
        // Filtro opcional por cédula de identidad
        $cedulaFilter = $request->input('cedula_identidad');
        $cursoIdFilter = $request->input('curso_id'); // Obtener el parámetro curso_id si está presente
        
        // Consulta para obtener los datos paginados que se mostrarán en la tabla
        $queryPaginated = DB::table('reporte_pagos')
            ->join('informacion_inscripcion', 'reporte_pagos.informacion_inscripcion_id', '=', 'informacion_inscripcion.id')
            ->join('datos_identificacion', 'informacion_inscripcion.datos_identificacion_id', '=', 'datos_identificacion.id')
            ->select('reporte_pagos.*', 'datos_identificacion.cedula_identidad') // Incluir cedula_identidad
            ->orderBy('reporte_pagos.fecha', 'desc'); // Ordena por fecha descendente para mostrar los últimos pagos primero
    
        // Aplicar el filtro de cédula de identidad a la consulta paginada
        if ($request->filled('cedula_identidad')) {
            $queryPaginated->where('datos_identificacion.cedula_identidad', 'LIKE', '%' . $cedulaFilter . '%');
        }
    
        // Filtro por centro_id
        if ($request->filled('centro_id')) {
            $queryPaginated->where('informacion_inscripcion.centro_id', $request->input('centro_id'));
        }
        if ($request->filled('tipo_pago_id')) {
            $queryPaginated->where('tipo_pago_id', $request->input('tipo_pago_id'));
        }
        if ($request->filled('forma_pago_id')) {
            $queryPaginated->where('forma_pago_id', $request->input('forma_pago_id'));
        }
    
        // Filtro por cohorte_id
        if ($request->filled('cohorte_id')) {
            $queryPaginated->where('informacion_inscripcion.cohorte_id', $request->input('cohorte_id'));
        }
    
        // Filtro por periodo_id
        if ($request->filled('periodo_id')) {
            $queryPaginated->where('informacion_inscripcion.periodo_id', $request->input('periodo_id'));
        }
        
        // Filtro opcional por curso_id
        if ($request->filled('curso_id')) {
            $queryPaginated->where('informacion_inscripcion.curso_id', $cursoIdFilter);
        }
        if ($request->filled('fecha_pago')) {
            $queryPaginated->where('fecha_pago', '>=', $request->fecha_pago);
        }
    
        // Obtener los datos paginados para mostrar en la tabla
        $pagosPaginados = $queryPaginated->paginate(10);
    
        // Consulta para obtener todos los datos filtrados (sin paginación) para las estadísticas
        $queryStatistics = DB::table('reporte_pagos')
            ->join('informacion_inscripcion', 'reporte_pagos.informacion_inscripcion_id', '=', 'informacion_inscripcion.id')
            ->join('datos_identificacion', 'informacion_inscripcion.datos_identificacion_id', '=', 'datos_identificacion.id')
            ->select('reporte_pagos.*', 'datos_identificacion.cedula_identidad'); // Incluir cedula_identidad
    
        // Aplicar el mismo filtro de cédula a la consulta de estadísticas
        if ($request->filled('cedula_identidad')) {
            $queryStatistics->where('datos_identificacion.cedula_identidad', 'LIKE', '%' . $cedulaFilter . '%');
        }
    
        // Filtro por centro_id
        if ($request->filled('centro_id')) {
            $queryStatistics->where('informacion_inscripcion.centro_id', $request->input('centro_id'));
        }
        if ($request->filled('tipo_pago_id')) {
            $queryStatistics->where('tipo_pago_id', $request->input('tipo_pago_id'));
        }
        if ($request->filled('forma_pago_id')) {
            $queryStatistics->where('forma_pago_id', $request->input('forma_pago_id'));
        }
       
    
        // Filtro por cohorte_id
        if ($request->filled('cohorte_id')) {
            $queryStatistics->where('informacion_inscripcion.cohorte_id', $request->input('cohorte_id'));
        }
    
        // Filtro por periodo_id
        if ($request->filled('periodo_id')) {
            $queryStatistics->where('informacion_inscripcion.periodo_id', $request->input('periodo_id'));
        }
    
        // Filtro opcional por curso_id en estadísticas
        if ($request->filled('curso_id')) {
            $queryStatistics->where('informacion_inscripcion.curso_id', $cursoIdFilter);
        }
        if ($request->filled('fecha_pago')) {
            $queryStatistics->where('fecha_pago', '>=', $request->fecha_pago);
        }
    
        // Obtener todos los datos filtrados para las estadísticas sin paginación
        $pagosParaEstadisticas = $queryStatistics->get();
    
        // Calcular estadísticas generales
        $totalPagos = $pagosParaEstadisticas->count();
        $totalMontoCancelado = $pagosParaEstadisticas->sum('monto_cancelado'); // Cambiado de avg a sum
    
        // Retornar los datos paginados y las estadísticas
        return response()->json([
            'datos' => $pagosPaginados,
            'estadisticas' => [
                'totalPagos' => $totalPagos,
                'totalMontoCancelado' => $totalMontoCancelado, // Cambiado a totalMontoCancelado
            ],
        ]);
    }


    public function getPagosWithStatisticsPrint(Request $request)
{
    // Filtro opcional por cédula de identidad
    $cedulaFilter = $request->input('cedula_identidad');
    $cursoIdFilter = $request->input('curso_id'); // Obtener el parámetro curso_id si está presente
    
    // Consulta para obtener todos los datos (sin paginación)
    $query = DB::table('reporte_pagos')
        ->join('informacion_inscripcion', 'reporte_pagos.informacion_inscripcion_id', '=', 'informacion_inscripcion.id')
        ->join('datos_identificacion', 'informacion_inscripcion.datos_identificacion_id', '=', 'datos_identificacion.id')
        ->select('reporte_pagos.*', 'datos_identificacion.cedula_identidad') // Incluir cedula_identidad
        ->orderBy('reporte_pagos.fecha', 'desc'); // Ordenar por fecha descendente para mostrar los últimos pagos primero

    // Filtro de cédula de identidad
    if ($request->filled('cedula_identidad')) {
        $query->where('datos_identificacion.cedula_identidad', 'LIKE', '%' . $cedulaFilter . '%');
    }

    // Filtro por centro_id
    if ($request->filled('centro_id')) {
        $query->where('informacion_inscripcion.centro_id', $request->input('centro_id'));
    }

    // Filtro por cohorte_id
    if ($request->filled('cohorte_id')) {
        $query->where('informacion_inscripcion.cohorte_id', $request->input('cohorte_id'));
    }

    // Filtro por periodo_id
    if ($request->filled('periodo_id')) {
        $query->where('informacion_inscripcion.periodo_id', $request->input('periodo_id'));
    }
    
    // Filtro opcional por curso_id
    if ($request->filled('curso_id')) {
        $query->where('informacion_inscripcion.curso_id', $cursoIdFilter);
    }
    if ($request->filled('tipo_pago_id')) {
        $query->where('tipo_pago_id', $request->input('tipo_pago_id'));
    }
    if ($request->filled('forma_pago_id')) {
        $query->where('forma_pago_id', $request->input('forma_pago_id'));
    }

    // Obtener todos los datos sin paginación
    $pagos = $query->get();

    // Consulta para obtener las estadísticas
    $totalPagos = $pagos->count();
    $totalMontoCancelado = $pagos->sum('monto_cancelado'); // Sumar monto cancelado
    
    // Retornar los datos y las estadísticas
    return response()->json([
        'datos' => $pagos,
        'estadisticas' => [
            'totalPagos' => $totalPagos,
            'totalMontoCancelado' => $totalMontoCancelado,
        ],
    ]);
}

    
    

public function getPagosByInscripcion(Request $request)
{
    $query = ReportePagos::query();

    // Aplicar el filtro de `informacion_inscripcion_id` si se proporciona
    if ($request->filled('informacion_inscripcion_id')) {
        $query->where('informacion_inscripcion_id', $request->informacion_inscripcion_id);
    }

    // Ejecutar la consulta y obtener todos los pagos que coinciden con el filtro
    $pagos = $query->get();

    return response()->json($pagos);
}






}
