<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatusSeleccion extends Model
{
    protected $table = 'status_seleccion';

    protected $fillable = ['descripcion'];
}
