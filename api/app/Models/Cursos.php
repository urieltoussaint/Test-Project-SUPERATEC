<?php

namespace App\Models;

use Illuminate\Support\Str;
class Cursos extends Model
{
    protected $table = 'cursos';
    protected $fillable = ['id', 'descripcion', 'cantidad_horas', 'area_id', 'costo', 'fecha_inicio','cod','status','cuotas','unidad_id','modalidad_id','tipo_programa_id','nivel_id'];
    protected $listable = ['id', 'descripcion', 'cantidad_horas', 'area_id', 'costo', 'fecha_inicio','cod','status','cuotas','unidad_id','modalidad_id','tipo_programa_id','nivel_id'];

    // Relación con InscripcionCursos (un curso puede tener muchas inscripciones)
    public function InformacionInscripcion()
    {
        // Aquí usamos 'curso_id' en lugar de 'cursos_id'
        return $this->hasMany(InformacionInscripcion::class, 'curso_id');
    }

    public function Unidad()
    {
        return $this->belongsTo(Unidad::class, 'unidad_id');
    }

    public function Modalidad()
    {
        return $this->belongsTo(Modalidad::class, 'modalidad_id');
    }

    public function TipoPrograma()
    {
        return $this->belongsTo(TipoPrograma::class, 'tipo_programa_id');
    }

    public function Nivel()
    {
        return $this->belongsTo(Nivel::class, 'nivel_id');
    }


    protected static function boot()
    {
        parent::boot();

        // Al eliminar un curso, también eliminar las inscripciones y pagos relacionados
        static::deleting(function ($curso) {
            $curso->InscripcionCursos()->each(function ($inscripcionCurso) {
                // Eliminar todos los pagos relacionados con esta inscripción
                $inscripcionCurso->ReportePagos()->delete();

                // Luego eliminar la inscripción
                $inscripcionCurso->delete();
            });
        });
    }
// Este método se ejecuta antes de que el curso sea creado
protected static function booted()
{
    static::creating(function ($curso) {
        $curso->cod = self::generateCourseCode($curso->descripcion);
    });
}

// Método para generar un código basado en el nombre
public static function generateCourseCode($nombre)
{
    // Tomamos las primeras 3 letras del nombre
    $prefix = strtoupper(substr($nombre, 0, 4));

    // Generamos un número aleatorio único de 3 dígitos
    $randomNumber = rand(100, 999);

    // Generamos una cadena aleatoria de 2 caracteres
    $suffix = Str::upper(Str::random(2));

    // Combinamos todos para crear el código
    return $prefix . $randomNumber . $suffix;
}




    
}
