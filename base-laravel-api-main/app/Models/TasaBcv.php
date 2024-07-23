<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TasaBcv extends Model
{
    use HasFactory;

    protected $table = 'tasa_bcv';

    protected $fillable = [
        'tasa',
    ];

    public $timestamps = false; // No manejamos las marcas de tiempo en el modelo
}
