<?php

namespace App\Models;
class InscripcionCursos extends Model
{
    protected $table = 'inscripcion_cursos';
    protected $fillable = ['id','cedula_identidad','fecha_inscripcion','curso_id','status_pay'];

    protected $listable = ['id','cedula_identidad','fecha_inscripcion','curso_id','status_pay'];

    public function DatosIdentificacion()
{
    return $this->hasOne(DatosIdentificacion::class, 'cedula_identidad', 'cedula_identidad');
}
    public function curso()
{
        return $this->belongsTo(Cursos::class, 'cursos_id','id');
}
public function ReportePagos()
    {
        return $this->hasMany(ReportePagos::class, 'inscripcion_curso_id');
    }


    protected static function boot()
    {
        parent::boot();
        // Al eliminar datos de inscritos, también eliminar los relacionados en reporte de pagos
        static::deleting(function ($cursos) {
            $cursos->ReportePagos()->delete();
        });
    }
}

   