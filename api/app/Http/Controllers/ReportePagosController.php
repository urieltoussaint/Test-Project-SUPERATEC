<?php
namespace App\Http\Controllers;

use App\Models\Cursos;
use App\Models\InscripcionCursos;
use App\Models\ReportePagos as Model;
use App\Models\ReportePagos;
use App\Models\TasaBcv;
use Illuminate\Http\Request;

class ReportePagosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;

    public function store(Request $request)
    {
        $inscripcionCurso = InscripcionCursos::find($request->inscripcion_curso_id);
        $cedulaIdentidad = $inscripcionCurso->cedula_identidad;
        $cursoId = $inscripcionCurso->curso_id;

        // Verificar si ya existe un pago para esta inscripción
        $pagoExistente = ReportePagos::where('inscripcion_curso_id', $request->inscripcion_curso_id)
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
            'inscripcion_curso_id' => $request->inscripcion_curso_id,
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
        $ultimoPago = ReportePagos::where('inscripcion_curso_id', $inscripcionCursoId)
                        ->where('cedula_identidad', $cedula)
                        ->orderBy('id', 'desc')
                        ->first();

        return response()->json($ultimoPago);
    }

    public function obtenerDetallePago($id)
    {
        // Obtener el reporte de pago por ID
        $reportePago = ReportePagos::findOrFail($id);

        // Obtener la inscripción del curso relacionada
        $inscripcionCurso = InscripcionCursos::where('inscripcion_cursos.id', $reportePago->inscripcion_curso_id)
                            ->join('cursos', 'inscripcion_cursos.curso_id', '=', 'cursos.id')
                            ->select('inscripcion_cursos.*', 'cursos.descripcion', 'cursos.costo')
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
            'inscripcion_curso_id' => $reportePago->inscripcion_curso_id,
            'conversion_cancelado' => $reportePago->conversion_cancelado,
            'conversion_restante' => $reportePago->conversion_restante,
            'conversion_total' => $reportePago->conversion_total,
            'conversion_exonerado' => $reportePago->conversion_exonerado,
            'tasa_bcv' => $tasaBcv->tasa,
            'curso_descripcion' => $inscripcionCurso->descripcion
        ];

        return response()->json($data);
    }



}
