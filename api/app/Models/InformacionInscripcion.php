<?php

namespace App\Models;


class InformacionInscripcion extends Model
{
    protected $table = 'informacion_inscripcion';
    protected $fillable = [
        'curso_id',
        'cohorte_id',
        'centro_id',
        'periodo_id',
        'fecha_inscripcion',
        'area_id',
        'unidad_id',
        'modalidad_id',
        'nivel_id',
        'tipo_programa_id',
        'es_patrocinado',
        'grupo',
        'observaciones',
        'cedula_identidad',
        'status_pay',
        'datos_identificacion_id',
        'patrocinante_id'

    ];
    protected $listable = [
        'id',
        'curso_id',
        'cohorte_id',
        'centro_id',
        'periodo_id',
        'fecha_inscripcion',
        'area_id',
        'unidad_id',
        'modalidad_id',
        'nivel_id',
        'tipo_programa_id',
        'es_patrocinado',
        'grupo',
        'observaciones',
        'cedula_identidad',
        'status_pay',
        'datos_identificacion_id',
        'patrocinante_id'
    ];

    // Definir relaciones
    public function DatosIdentificacion()
    {
        return $this->hasOne(DatosIdentificacion::class, 'datos_identificacion_id', 'id');
    }
   
    public function curso()
    {
            return $this->belongsTo(Cursos::class, 'curso_id','id');
    }

    public function cohorte()
    {
        return $this->belongsTo(Cohorte::class, 'cohorte_id');
    }


    public function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id');
    }

    public function periodo()
    {
        return $this->belongsTo(Periodo::class, 'periodo_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function unidad()
    {
        return $this->belongsTo(Unidad::class, 'unidad_id');
    }

    public function modalidad()
    {
        return $this->belongsTo(Modalidad::class, 'modalidad_id');
    }

    public function nivel()
    {
        return $this->belongsTo(Nivel::class, 'nivel_id');
    }

    public function tipoPrograma()
    {
        return $this->belongsTo(TipoPrograma::class, 'tipo_programa_id');
    }
    public function Patrocinante()
    {
        return $this->belongsTo(Patrocinante::class, 'patrocinante_id');
    }

    public function ReportePagos()
    {
        return $this->hasMany(ReportePagos::class, 'informacion_inscripcion_id');
    }


    protected static function boot()
    {
        parent::boot();
    
        static::deleting(function ($informacionInscripcion) {
          
            \App\Models\Peticiones::where('key', $informacionInscripcion->id)
            ->where('zona_id', 3)
            ->delete();

        });
    }

}
