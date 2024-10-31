<?php

namespace App\Models;


class Promocion extends Model
{
    protected $table = 'promocion';
    protected $fillable = ['centro_id','cohorte_id','periodo_id','fecha_promocion','procedencia_id','mencion_id',
    'estudiantes_asistentes','estudiantes_interesados','comentarios'];
    protected $listable = ['id','fecha_registro','centro_id','cohorte_id','periodo_id','fecha_promocion','procedencia_id','mencion_id',
    'estudiantes_asistentes','estudiantes_interesados','comentarios'];


    public function Centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id');
    }
    public function Procedencia()
    {
        return $this->belongsTo(Procedencia::class, 'procedencia_id');
    }
    public function Cohorte()
    {
        return $this->belongsTo(Cohorte::class, 'cohorte_id');
    }
    public function Periodo()
    {
        return $this->belongsTo(Periodo::class, 'periodo_id');
    }
    
    public function Mencion()
    {
        return $this->belongsTo(Mencion::class, 'mencion_id');
    }
}
