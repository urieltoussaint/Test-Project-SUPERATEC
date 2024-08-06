<?php

namespace App\Models;
class ReportePagos extends Model
{
    protected $table = 'reporte_pagos';
    protected $fillable = ['monto_cancelado','monto_total','monto_exonerado','monto_restante','tipo_moneda','comentario_cuota','inscripcion_curso_id','cedula_identidad','conversion_cancelado','conversion_total','conversion_restante','conversion_exonerado','tasa_bcv_id'];
    protected $listable = ['monto_cancelado','id','monto_total','monto_exonerado','monto_restante','tipo_moneda','comentario_cuota','inscripcion_curso_id','fecha','cedula_identidad','conversion_cancelado','conversion_total','conversion_restante','conversion_exonerado','tasa_bcv_id'];


    public function inscripcionCursos()
    {
        return $this->belongsTo(InscripcionCursos::class, 'inscripcion_curso_id');
    }
    public function TasaBcv()
    {
        return $this->belongsTo(TasaBcv::class, 'tasa_bcv_id');
    }



}
