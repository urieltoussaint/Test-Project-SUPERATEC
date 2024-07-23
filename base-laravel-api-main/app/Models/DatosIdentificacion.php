<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatosIdentificacion extends Model
{
    protected $table = 'datos_identificacion';
    protected $primaryKey = 'cedula_identidad';
    public $incrementing = false; // No autoincrementable porque es VARCHAR

    protected $fillable = [
        'cedula_identidad',
        'status_seleccion_id',
        'nacionalidad_id',
        'nombres',
        'apellidos',
        'fecha_nacimiento',
        'edad',
        'genero_id',
        'grupo_prioritario_id',
        'direccion',
        'fecha_actual',
        'estado_id',
        'direccion_email',
        'procedencia_id',
        'telefono_casa',
        'telefono_celular',
        'nivel_instruccion_id',
        'nro_documento'
    ];
}
