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

    public function store(Request $request)
    {
        $inscripcionCurso = InformacionInscripcion::find($request->informacion_inscripcion_id);
        $cedulaIdentidad = $inscripcionCurso->cedula_identidad;
        $cursoId = $inscripcionCurso->curso_id;

        // Verificar si ya existe un pago para esta inscripción
        $pagoExistente = ReportePagos::where('informacion_inscripcion_id', $request->informacion_inscripcion_id)
                             ->where('cedula_identidad', $cedulaIdentidad)
                             ->orderBy('id', 'desc')
                             ->first();

        if ($pagoExistente) {
            // Si existe un pago previo, usar el monto restante del pago más reciente
            $montoTotal = $pagoExistente->monto_restante;
        } else {
            // Si no hay pagos previos, usar el costo del curso
            $curso = Cursos::find($cursoId);
            $montoTotal = $curso->costo;
        }

        $montoCancelado = $request->monto_cancelado;
        $montoExonerado = $request->monto_exonerado;
        $montoRestante = $montoTotal - $montoCancelado - $montoExonerado;

        // Obtener la tasa de conversión más reciente
        $tasaBcv = TasaBcv::orderBy('id', 'desc')->first();
        $tasa = $tasaBcv ? $tasaBcv->tasa : 1;

        $conversionTotal = $montoTotal * $tasa;
        $conversionCancelado = $montoCancelado * $tasa;
        $conversionExonerado = $montoExonerado * $tasa;
        $conversionRestante = $montoRestante * $tasa;

        $pago = new ReportePagos([
            'informacion_inscripcion_id' => $request->informacion_inscripcion_id,
            'cedula_identidad' => $cedulaIdentidad,
            'monto_total' => $montoTotal,
            'monto_cancelado' => $montoCancelado,
            'monto_exonerado' => $montoExonerado,
            'monto_restante' => $montoRestante,
            'tipo_moneda' => $request->tipo_moneda,
            'conversion_total' => $conversionTotal,
            'conversion_cancelado' => $conversionCancelado,
            'conversion_exonerado' => $conversionExonerado,
            'conversion_restante' => $conversionRestante,
            'tasa_bcv_id' => $tasaBcv->id,
            'comentario_cuota' => $request->comentario_cuota 
        ]);

        $pago->save();

        return response()->json($pago, 201);
    }

    public function obtenerUltimoPago($inscripcionCursoId, $cedula)
{
    $ultimoPago = ReportePagos::where('informacion_inscripcion_id', $inscripcionCursoId)
                    ->where('cedula_identidad', $cedula)
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
                            ->select('informacion_inscripcion.*', 'cursos.descripcion', 'cursos.costo')
                            ->first();

        // Obtener la tasa BCV relacionada
        $tasaBcv = TasaBcv::find($reportePago->tasa_bcv_id);

        // Verificar si no se encontró la inscripción del curso o la tasa BCV
        if (!$inscripcionCurso || !$tasaBcv) {
            return response()->json(['error' => 'Datos no encontrados'], 404);
        }

        // Construir la respuesta con los datos necesarios
        $data = [
            'id' => $reportePago->id,
            'cedula_identidad' => $reportePago->cedula_identidad,
            'fecha' => $reportePago->fecha,
            'monto_cancelado' => $reportePago->monto_cancelado,
            'monto_total' => $reportePago->monto_total,
            'monto_exonerado' => $reportePago->monto_exonerado,
            'monto_restante' => $reportePago->monto_restante,
            'tipo_moneda' => $reportePago->tipo_moneda,
            'comentario_cuota' => $reportePago->comentario_cuota,
            'informacion_inscripcion_id' => $reportePago->informacion_inscripcion_id,
            'conversion_cancelado' => $reportePago->conversion_cancelado,
            'conversion_restante' => $reportePago->conversion_restante,
            'conversion_total' => $reportePago->conversion_total,
            'conversion_exonerado' => $reportePago->conversion_exonerado,
            'tasa_bcv' => $tasaBcv->tasa,
            'curso_descripcion' => $inscripcionCurso->descripcion
        ];

        return response()->json($data);
    }


    public function getPagosWithStatistics(Request $request)
{
    // Filtro opcional por cédula de identidad
    $cedulaFilter = $request->input('cedula_identidad');

    // Consulta para obtener los datos paginados que se mostrarán en la tabla
    $queryPaginated = DB::table('reporte_pagos')
        ->orderBy('fecha', 'desc'); // Ordena por fecha descendente para mostrar los últimos pagos primero

    // Aplicar el filtro de cédula de identidad a la consulta paginada
    if ($request->filled('cedula_identidad')) {
        $queryPaginated->where('cedula_identidad', 'LIKE', "%{$cedulaFilter}%");
    }

    // Obtener los datos paginados para mostrar en la tabla
    $pagosPaginados = $queryPaginated->paginate(10);

    // Consulta para obtener todos los datos filtrados (sin paginación) para las estadísticas
    $queryStatistics = DB::table('reporte_pagos');

    // Aplicar el mismo filtro de cédula a la consulta de estadísticas
    if ($request->filled('cedula_identidad')) {
        $queryStatistics->where('cedula_identidad', 'LIKE', "%{$cedulaFilter}%");
    }

    // Obtener todos los datos filtrados para las estadísticas sin paginación
    $pagosParaEstadisticas = $queryStatistics->get();

    // Calcular estadísticas generales
    $totalPagos = $pagosParaEstadisticas->count();
    $promedioMontoCancelado = $totalPagos > 0 ? $pagosParaEstadisticas->avg('monto_cancelado') : 0;

    // Retornar los datos paginados y las estadísticas
    return response()->json([
        'datos' => $pagosPaginados,
        'estadisticas' => [
            'totalPagos' => $totalPagos,
            'promedioMontoCancelado' => $promedioMontoCancelado,
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
