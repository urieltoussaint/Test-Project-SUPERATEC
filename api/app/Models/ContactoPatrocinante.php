<?php

namespace App\Models;

class ContactoPatrocinante extends Model
{
    protected $table = 'contacto_patrocinante';

    protected $listable = ['id','descripcion','patrocinante_id',
    'nombre_principal','cargo_principal','telefono_principal','email_principal'
    ,'nombre_adicional','cargo_adicional','telefono_adicional','email_adicional',
    'nombre_adicional2','cargo_adicional2','telefono_adicional2','email_adicional2',];

    protected $fillable = ['descripcion','patrocinante_id',
    'nombre_principal','cargo_principal','telefono_principal','email_principal'
    ,'nombre_adicional','cargo_adicional','telefono_adicional','email_adicional',
    'nombre_adicional2','cargo_adicional2','telefono_adicional2','email_adicional2',];


    public function ContactoPatrocinante()
    {
        return $this->hasOne(ContactoPatrocinante::class, 'id', 'id');
    }
}
