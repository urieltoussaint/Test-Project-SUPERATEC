<?php

namespace App\Models;
class Cursos extends Model
{
    protected $table = 'cursos';
    protected $fillable = ['id','descripcion','cantidad_horas','area_id','costo','fecha_inicio'];
    protected $listable = ['id','descripcion','cantidad_horas','area_id','costo','fecha_inicio'];

}
