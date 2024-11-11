<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VistaDatosIdentificacion extends Model
{
    protected $table = 'vista_datos_identificacion';
    public $incrementing = true;
    public $timestamps = false; // Si la vista no tiene timestamps
}
