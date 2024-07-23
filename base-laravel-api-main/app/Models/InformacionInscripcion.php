<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InformacionInscripcion extends Model
{
    protected $table = 'informacion_inscripcion';

    protected $fillable = [
        'como_entero_superatec_id',
        'cohorte_id',
        'centro_id',
        'periodo_id',
        'fecha_inscripcion',
        'area_id',
        'unidad_id',
        'modalidad_id',
        'nivel_id',
        'tipo_programa_id',
        'realiza_aporte',
        'es_patrocinado',
        'grupo',
        'observaciones',
        'cedula_identidad'
    ];
}
