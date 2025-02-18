<?php

namespace App\Models;
class ReportePagos extends Model
{
    protected $table = 'reporte_pagos';
    protected $fillable = ['monto_cancelado','monto_total','monto_exonerado','monto_restante_cuota','tipo_moneda','comentario_cuota','informacion_inscripcion_id','conversion_cancelado','conversion_total'
    ,'conversion_restante','conversion_exonerado','tasa_bcv_id','forma_pago_id','tipo_pago_id','monto_restante_inscripcion','numero_comprobante','serial_billete','fecha_pago'];
    protected $listable = ['monto_cancelado','id','monto_total','monto_exonerado','monto_restante_cuota','tipo_moneda','comentario_cuota','informacion_inscripcion_id','fecha','conversion_cancelado','conversion_total',
    'conversion_restante','conversion_exonerado','tasa_bcv_id','forma_pago_id','tipo_pago_id','monto_restante_inscripcion','numero_comprobante','serial_billete','fecha_pago'];


    public function informacionInscripcion()
    {
        return $this->belongsTo(InformacionInscripcion::class, 'informacion_inscripcion_id');
    }
    public function TasaBcv()
    {
        return $this->belongsTo(TasaBcv::class, 'tasa_bcv_id');
    }
    public function FormaPago()
    {
        return $this->belongsTo(FormaPago::class, 'forma_pago_id');
    }
    public function TipoPago()
    {
        return $this->belongsTo(TipoPago::class, 'tipo_pago_id');
    }


}
