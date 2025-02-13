<?php

namespace App\Models;

class TipoPago extends Model
{
    protected $table = 'tipo_pago';

    protected $listable = ['descripcion','id'];
}
