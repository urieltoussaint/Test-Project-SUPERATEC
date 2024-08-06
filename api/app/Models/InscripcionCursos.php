<?php

namespace App\Models;
class InscripcionCursos extends Model
{
    protected $table = 'inscripcion_cursos';
    protected $fillable = ['id','cedula_identidad','fecha_inscripcion','curso_id'];

    protected $listable = ['id','cedula_identidad','fecha_inscripcion','curso_id'];

    public function DatosIdentificacion()
{
    return $this->hasOne(DatosIdentificacion::class, 'cedula_identidad', 'cedula_identidad');
}
    public function curso()
{
        return $this->belongsTo(Cursos::class, 'cursos_id','id');
}
}

   