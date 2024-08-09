<?php

namespace App\Models;



class PersonalesVoluntariados extends Model
{
    protected $table = 'personales_voluntariados';
    protected $primaryKey = 'cedula_identidad';
    protected $keyType= 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['cedula_identidad','nombres','apellidos','fecha_nacimiento',
    'genero_id','telefono_casa','telefono_celular','email','direccion','nivel_instruccion_id','procedencia_id','como_entero_superatec_id','ocupacion'];

    protected $listable = ['cedula_identidad','nombres','apellidos','fecha_nacimiento',
    'genero_id','telefono_casa','telefono_celular','email','direccion','nivel_instruccion_id','procedencia_id','como_entero_superatec_id','fecha_registro','ocupacion'];


    public function InformacionVoluntariados()
    {
        return $this->hasOne(InformacionVoluntariados::class, 'cedula_identidad', 'cedula_identidad');
    }

    public function NivelInstruccion()
    {
        return $this->belongsTo(NivelInstruccion::class, 'nivel_instruccion_id');
    }

    public function Procedencia()
    {
        return $this->belongsTo(Procedencia::class, 'procedencia_id');
    }
    public function ComoEnteroSuperatec()
    {
        return $this->belongsTo(ComoEnteroSuperatec::class, 'como_entero_superatec_id');
    }
    public function Genero()
    {
        return $this->belongsTo(Genero::class, 'genero_id');
    }

    protected static function boot()
    {
        parent::boot();
        static::deleting(function ($PersonalesVoluntariados) {
            $PersonalesVoluntariados->InformacionVoluntariados()->delete();
        });
    }
    
}
