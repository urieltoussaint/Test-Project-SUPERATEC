<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class TasaBcv extends Model
{

    protected $table = 'tasa_bcv';

    protected $fillable = [
        'tasa','created_at'
    ];
    protected $listable = [
        'tasa','created_at'
    ];

    public $timestamps = false; // No manejamos las marcas de tiempo en el modelo
}
