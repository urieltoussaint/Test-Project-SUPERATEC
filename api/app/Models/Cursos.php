<?php

namespace App\Models;

class Cursos extends Model
{
    /**
     * The primary key of the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['nombre', 'universidad', 'descripcion'];

    /**
     * The attributes that should be shown in lists.
     *
     * @var array
     */
    protected $listable = ['nombre', 'universidad', 'descripcion'];
}
