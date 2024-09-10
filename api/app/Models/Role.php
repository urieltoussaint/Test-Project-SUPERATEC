<?php

namespace App\Models;



class Role extends Model
{
    protected $table = 'role';

    protected $listable = ['name','id'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}


