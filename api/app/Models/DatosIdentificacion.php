<?php

namespace App\Models;

//use Illuminate\Database\Eloquent\Model;

class DatosIdentificacion extends Model
{
    protected $table = 'datos_identificacion';


    protected $fillable = [
        'cedula_identidad',
        'nacionalidad_id',
        'nombres',
        'apellidos',
        'fecha_nacimiento',
        'genero_id',
        'grupo_prioritario_id',
        'direccion',
        'estado_id',
        'direccion_email',
        'procedencia_id',
        'telefono_casa',
        'telefono_celular',
        'nivel_instruccion_id',
        'municipio',
        'como_entero_superatec_id',
        
       
    ];
    protected $listable = [
        'id',
        'cedula_identidad',
        'nacionalidad_id',
        'nombres',
        'apellidos',
        'fecha_nacimiento',
        'genero_id',
        'grupo_prioritario_id',
        'direccion',
        'estado_id',
        'direccion_email',
        'procedencia_id',
        'telefono_casa',
        'telefono_celular',
        'nivel_instruccion_id',
        'municipio',
        'como_entero_superatec_id',
        'created_at'
       
        
    ];
    
    // Definir relaciones
  
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
    return $this->hasOne(InformacionInscripcion::class, 'datos_identificacion_id', 'id');
}

    public function ReportePagos()
    {
        return $this->hasOne(ReportePagos::class, 'cedula_identidad', 'cedula_identidad');
    }
 

    public function Peticiones()
{
    return $this->hasOne(Peticiones::class, 'key', 'cedula_identidad');
}
public function ComoEnteroSuperatec()
{
    return $this->belongsTo(ComoEnteroSuperatec::class, 'como_entero_superatec_id');
}

    protected static function boot()
    {
        parent::boot();
    
        static::deleting(function ($datosIdentificacion) {
            // Recorrer cada inscripción relacionada y eliminar sus pagos antes de eliminar la inscripción
            $datosIdentificacion->informacionInscripcion()->each(function ($informacionInscripcion) {
                // Eliminar todos los pagos relacionados con esta inscripción
                $informacionInscripcion->ReportePagos()->delete();
    
                // Luego eliminar la inscripción
                $informacionInscripcion->delete();
            });
    
            // Ahora puedes eliminar cualquier otra relación directa (por ejemplo, InformacionInscripcion)
            $datosIdentificacion->informacionInscripcion()->delete();
            \App\Models\Peticiones::where('key', $datosIdentificacion->id)
            ->where('zona_id', 1)
            ->delete();

        });
    }
    
}