<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class DatosIdentificacion extends Model
{
    protected $table = 'datos_identificacion';
    protected $primaryKey = 'cedula_identidad';
    public $incrementing = false; // No autoincrementable porque es VARCHAR
    public $timestamps = false; // Desactiva las marcas de tiempo automáticas

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

    // Usar los eventos del modelo para establecer valores predeterminados
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Establecer la fecha actual
            $model->fecha_actual = now();

            // Obtener el último número de documento y sumarle uno
            $lastNroDocumento = DB::table('datos_identificacion')->max('nro_documento');
            $model->nro_documento = $lastNroDocumento ? $lastNroDocumento + 1 : 1;
        });
    }

    // Definir relaciones
    public function statusSeleccion()
    {
        return $this->belongsTo(StatusSeleccion::class, 'status_seleccion_id');
    }

    public function nacionalidad()
    {
        return $this->belongsTo(Nacionalidad::class, 'nacionalidad_id');
    }

    public function genero()
    {
        return $this->belongsTo(Genero::class, 'genero_id');
    }

    public function grupoPrioritario()
    {
        return $this->belongsTo(GrupoPrioritario::class, 'grupo_prioritario_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function procedencia()
    {
        return $this->belongsTo(Procedencia::class, 'procedencia_id');
    }

    public function nivelInstruccion()
    {
        return $this->belongsTo(NivelInstruccion::class, 'nivel_instruccion_id');
    }
}
