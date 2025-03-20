<?php

namespace App\Models;



class PartBolsaEmpleo extends Model
{
    protected $table = 'part_bolsa_empleo';

    protected $listable = ['id','datos_identificacion_id','estado_civil_id','discapacidad_id','disponibilidad_id','entorno_familiar','fortalezas',
    'aspectos_mejorables','exp_laboral_id','quien_vive_id','rol_hogar_id','tlf_casa','tlf_celular','email','sector','horario_mañana_id','horario_tarde_id'
    
];
protected $fillable = ['datos_identificacion_id','estado_civil_id','discapacidad_id','disponibilidad_id','entorno_familiar','fortalezas',
    'aspectos_mejorables','exp_laboral_id','quien_vive_id','rol_hogar_id','tlf_casa','tlf_celular','email','sector','horario_mañana_id','horario_tarde_id'
];

public function datosIdentificacion()
{
    return $this->hasOne(DatosIdentificacion::class,  'id','datos_identificacion_id');
}


public function EstadoCivil()
{
        return $this->belongsTo(EstadoCivil::class, 'estado_civil_id','id');
}
public function Discapacidad()
{
        return $this->belongsTo(Discapacidad::class, 'discapacidad_id','id');
}
public function Disponibilidad()
{
        return $this->belongsTo(Disponibilidad::class, 'disponibilidad_id','id');
}
public function ExpLaboral()
{
        return $this->belongsTo(ExpLaboral::class, 'exp_laboral_id','id');
}
public function QuienVive()
{
        return $this->belongsTo(QuienVive::class, 'quien_vive_id','id');
}

public function RolHogar()
{
        return $this->belongsTo(RolHogar::class, 'rol_hogar_id','id');
}
public function HorarioMañana()
{
        return $this->belongsTo(HorarioMañana::class, 'horario_mañana_id','id');
}
public function HorarioTarde()
{
        return $this->belongsTo(HorarioTarde::class, 'horario_tarde_id','id');
}
public function partBolsaEmpleo()
{
    return $this->belongsTo(PartBolsaEmpleo::class, 'part_bolsa_empleo_id');
}



}
