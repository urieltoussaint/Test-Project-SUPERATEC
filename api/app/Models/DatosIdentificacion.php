<?php

namespace App\Models;

//use Illuminate\Database\Eloquent\Model;

class DatosIdentificacion extends Model
{
    protected $table = 'datos_identificacion';
    protected $primaryKey = 'cedula_identidad';
    public $incrementing = false;
    public $timestamps = false;

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
    protected $listable = [
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

    public function informacionInscripcion()
{
    return $this->hasOne(InformacionInscripcion::class, 'cedula_identidad', 'cedula_identidad');
}
}