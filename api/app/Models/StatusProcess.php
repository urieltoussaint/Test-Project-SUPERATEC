<?php

namespace App\Models;


class StatusProcess extends Model
{
    protected $table = 'status_process';

    protected $listable = ['descripcion','id'];

    public function users()
    {
        return $this->hasMany(Peticiones::class);
    }

}

