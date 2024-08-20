<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    // Especificar la tabla 'users' (opcional si el nombre coincide con el modelo)
    protected $table = 'users';

    // Campos que pueden ser llenados mediante asignación masiva
    protected $fillable = [
        'name', 'email', 'password',
    ];

    // Campos que deben estar ocultos cuando el modelo se convierte a JSON
    protected $hidden = [
        'password', 'remember_token', 'api_token',
    ];

    // Casters para atributos
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
   


    // Si estás usando el remember_token para autenticación API, no necesitas más ajustes.
}
