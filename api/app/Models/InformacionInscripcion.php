<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InformacionInscripcion extends Model
{
    protected $table = 'informacion_inscripcion';
    public $timestamps = false; // Desactiva las marcas de tiempo automáticas

    protected $fillable = [
        'como_entero_superatec_id',
        'cohorte_id',
        'centro_id',
        'periodo_id',
        'fecha_inscripcion',
        'area_id',
        'unidad_id',
        'modalidad_id',
        'nivel_id',
        'tipo_programa_id',
        'realiza_aporte',
        'es_patrocinado',
        'grupo',
        'observaciones',
        'cedula_identidad'
    ];
    protected $listable = [
        'descripcion','id','cedula_identidad'
    ];

    // Definir relaciones
    public function comoEnteroSuperatec()
    {
        return $this->belongsTo(ComoEnteroSuperatec::class, 'como_entero_superatec_id');
    }

    public function cohorte()
    {
        return $this->belongsTo(Cohorte::class, 'cohorte_id');
    }

    public function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id');
    }

    public function periodo()
    {
        return $this->belongsTo(Periodo::class, 'periodo_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function unidad()
    {
        return $this->belongsTo(Unidad::class, 'unidad_id');
    }

    public function modalidad()
    {
        return $this->belongsTo(Modalidad::class, 'modalidad_id');
    }

    public function nivel()
    {
        return $this->belongsTo(Nivel::class, 'nivel_id');
    }

    public function tipoPrograma()
    {
        return $this->belongsTo(TipoPrograma::class, 'tipo_programa_id');
    }
}
