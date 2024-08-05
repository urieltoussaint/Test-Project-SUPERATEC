<?php

namespace App\Models;
class ReportePagos extends Model
{
    protected $table = 'reporte_pagos';

    protected $listable = ['monto_cancelado','id','fecha',];
}
