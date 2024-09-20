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
        'finish_time'
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
        'finish_time'
    ];


    public function User()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function Zonas()
    {
        return $this->belongsTo(Zonas::class, 'zona_id');
    }

    public function StatusProcess()
    {
        return $this->belongsTo(StatusProcess::class, 'status_process_id');
    }
}
