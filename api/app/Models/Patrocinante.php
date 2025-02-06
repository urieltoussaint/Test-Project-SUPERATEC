<?php

namespace App\Models;

class Patrocinante extends Model
{
    protected $table = 'patrocinante';

    protected $listable = ['id','nombre_patrocinante','empresa_persona','rif_cedula','telefono','direccion','ciudad',
    'estado_id','pais_id','codigo_postal','web','email','es_patrocinante','bolsa_empleo','referido_por','otra_info','nit','tipo_patrocinante_id','tipo_industria_id','tipo_doc_id'];

    protected $fillable = ['nombre_patrocinante','empresa_persona','rif_cedula','telefono','direccion','ciudad',
    'estado_id','pais_id','codigo_postal','web','email','es_patrocinante','bolsa_empleo','referido_por','otra_info','nit','tipo_patrocinante_id','tipo_industria_id','tipo_doc_id'];

    public function ContactoPatrocinante()
    {
        return $this->hasOne(ContactoPatrocinante::class, 'patrocinante_id', 'id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function tipoPatrocinante()
    {
        return $this->belongsTo(TipoPatrocinante::class, 'tipo_patrocinante_id');
    }
    
    public function tipoIndustria()
    {
        return $this->belongsTo(TipoIndustria::class, 'tipo_industria_id');
    }
    public function Pais()
    {
        return $this->belongsTo(Pais::class, 'pais_id');
    }
    public function TipoDoc()
    {
        return $this->belongsTo(TipoDoc::class, 'tipo_doc_id');
    }

    protected static function boot()
    {
        parent::boot();
    
        static::deleting(function ($patrocinante) {
         
            \App\Models\Peticiones::where('key', $patrocinante->id)
            ->where('zona_id', 6)
            ->delete();

        });
    }

}
