<?php

namespace App\Models;

use Illuminate\Support\Str;
class Cursos extends Model
{
    protected $table = 'cursos';
    protected $fillable = ['id', 'descripcion', 'cantidad_horas', 'area_id', 'costo', 'fecha_inicio','cod','status'];
    protected $listable = ['id', 'descripcion', 'cantidad_horas', 'area_id', 'costo', 'fecha_inicio','cod','status'];

    // Relación con InscripcionCursos (un curso puede tener muchas inscripciones)
    public function InscripcionCursos()
    {
        // Aquí usamos 'curso_id' en lugar de 'cursos_id'
        return $this->hasMany(InscripcionCursos::class, 'curso_id');
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
