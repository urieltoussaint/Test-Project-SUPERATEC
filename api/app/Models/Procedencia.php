<?php

namespace App\Models;


class Procedencia extends Model
{
    protected $table = 'procedencia';

    protected $listable = ['descripcion','direccion','fecha','id','cod'];
    protected $fillable = ['descripcion','direccion','fecha','cod'];


    protected static function boot()
    {
        parent::boot();
    
        static::deleting(function ($procedencia) {
          
            \App\Models\Peticiones::where('key', $procedencia->id)
            ->where('zona_id', 7)
            ->delete();

        });
    }
}
