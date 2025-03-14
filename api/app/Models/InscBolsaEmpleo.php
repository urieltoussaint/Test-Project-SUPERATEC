<?php

namespace App\Models;

class InscBolsaEmpleo extends Model
{
    protected $table = 'incs_bolsa_empleo';

    protected $listable = ['id','patrocinante_id','part_bolsa_empleo_id','cargo_ofrecido','email','fecha_post'];
    protected $fillable = ['patrocinante_id','part_bolsa_empleo_id','cargo_ofrecido','email','fecha_post'];

    public function Patrocinante()
{
    return $this->hasOne(Patrocinante::class,  'id','patrocinante_id');
}

public function PartBolsaEmpleo()
{
    return $this->hasOne(PartBolsaEmpleo::class,  'id','part_bolsa_empleo_id');
}

}
