<?php

namespace App\Models;


class Cursos extends Model
{
    protected $table = 'cursos';
    protected $fillable = ['id', 'descripcion', 'cantidad_horas', 'area_id', 'costo', 'fecha_inicio'];
    protected $listable = ['id', 'descripcion', 'cantidad_horas', 'area_id', 'costo', 'fecha_inicio'];

    // Relación con InscripcionCursos (un curso puede tener muchas inscripciones)
    public function InscripcionCursos()
    {
        // Aquí usamos 'curso_id' en lugar de 'cursos_id'
        return $this->hasMany(InscripcionCursos::class, 'curso_id');
    }

    protected static function boot()
    {
        parent::boot();

        // Al eliminar un curso, también eliminar las inscripciones y pagos relacionados
        static::deleting(function ($curso) {
            $curso->InscripcionCursos()->each(function ($inscripcionCurso) {
                // Eliminar todos los pagos relacionados con esta inscripción
                $inscripcionCurso->ReportePagos()->delete();

                // Luego eliminar la inscripción
                $inscripcionCurso->delete();
            });
        });
    }
}
