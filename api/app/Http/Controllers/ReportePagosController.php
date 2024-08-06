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
            'comentario_cuota' => $request->comentario_cuota // Agregamos el comentario_cuota
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
}
