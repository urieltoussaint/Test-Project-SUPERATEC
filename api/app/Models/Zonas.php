<?php

namespace App\Models;


class Zonas extends Model
{
    protected $table = 'zonas';

    protected $listable = ['name','id'];

    public function users()
    {
        return $this->hasMany(Peticiones::class);
    }
}
