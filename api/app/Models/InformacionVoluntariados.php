<?php

namespace App\Models;


class InformacionVoluntariados extends Model
{
    protected $table = 'informacion_voluntariados';
    protected $fillable = ['cedula_identidad','tipo_voluntariado_id','area_voluntariado_id','centro_id','actividades_realizar','turno_id','fecha_inicio','horas_totales'];

    protected $listable = ['id','cedula_identidad','tipo_voluntariado_id','area_voluntariado_id','centro_id','actividades_realizar','turno_id','fecha_inicio','horas_totales'];

    public function TipoVoluntariado()
    {
        return $this->belongsTo(TipoVoluntariado::class, 'tipo_voluntariado_id');
    }
    
    public function Area()
    {
        return $this->belongsTo(Area::class, 'area_voluntariado_id');
    }
    public function Centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id');
    }
    public function Turnos()
    {
        return $this->belongsTo(Turnos::class, 'turno_id');
    }
}
