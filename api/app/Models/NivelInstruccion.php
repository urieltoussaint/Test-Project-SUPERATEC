<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NivelInstruccion extends Model
{
    protected $table = 'nivel_instruccion';

    protected $fillable = ['descripcion'];
}
