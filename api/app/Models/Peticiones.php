<?php

namespace App\Models;

class Peticiones extends Model
{
    protected $table = 'peticiones';

    // Campos que son asignables en masa
    protected $fillable = [
        'user_id', 
        'destinatario_id', 
        'role_id', 
        'zona_id', 
        'key',
        'status', 
        'created_at', 
        'finish_time',
        'comentario',
        'user_success'
    ];

    protected $listable = [
        'id',
        'user_id', 
        'destinatario_id', 
        'role_id', 
        'zona_id', 
        'key',
        'status', 
        'created_at', 
        'finish_time',
        'comentario',
        'user_success'
    ];


    public function User()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function userSuccess()
    {
        return $this->belongsTo(User::class, 'user_success', 'id');  // 'user_success' es el campo en la tabla peticiones
    }
    

    public function Zonas()
    {
        return $this->belongsTo(Zonas::class, 'zona_id');
    }


}
