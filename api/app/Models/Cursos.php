<?php

namespace App\Models;

use Illuminate\Support\Str;
class Cursos extends Model
{
    protected $table = 'cursos';
    protected $fillable = ['id', 'descripcion', 'cantidad_horas', 'area_id', 'costo', 'fecha_inicio','cod','status','cuotas','unidad_id','modalidad_id','tipo_programa_id','nivel_id','externo','sesiones','grupo_id','costo_inscripcion','area2_id','area3_id','area4_id','area5_id'];
    protected $listable = ['id', 'descripcion', 'cantidad_horas', 'area_id', 'costo', 'fecha_inicio','cod','status','cuotas','unidad_id','modalidad_id','tipo_programa_id','nivel_id','externo','sesiones','grupo_id','costo_inscripcion','area2_id','area3_id','area4_id','area5_id'];

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
    public function Area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }
    

    public function Grupo()
    {
        return $this->belongsTo(Grupo::class, 'grupo_id');
    }

    public function Area2()
    {
        return $this->belongsTo(Area::class, 'area2_id');
    }

    public function Area3()
    {
        return $this->belongsTo(Area::class, 'area3_id');
    }

    public function Area4()
    {
        return $this->belongsTo(Area::class, 'area4_id');
    }

    public function Area5()
    {
        return $this->belongsTo(Area::class, 'area5_id');
    }

    


    protected static function boot()
    {
        parent::boot();

        // Al eliminar un curso, también eliminar las inscripciones y pagos relacionados
        static::deleting(function ($curso) {
            $curso->InformacionInscripcion()->each(function ($inscripcionCurso) {
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
        $curso->cod = self::generateCourseCode($curso);
    });

    static::updating(function ($curso) {
        // Solo regenerar el código si 'descripcion' o campos relacionados cambian
        if ($curso->isDirty(['descripcion', 'area_id', 'unidad_id', 'modalidad_id', 'tipo_programa_id', 'nivel_id', 'grupo_id'])) {
            $curso->cod = self::generateCourseCode($curso);
        }
    });
}


// Método para generar un código basado en las descripciones relacionadas y el nombre del curso
public static function generateCourseCode($curso)
{
    // 1. Inicial de Modalidad
    $modalidad = $curso->modalidad->descripcion ?? '';
    $modalidadInicial = strtoupper(substr($modalidad, 0, 1));

    // 2. Inicial de Tipo de Programa
    $tipoPrograma = $curso->tipoPrograma->descripcion ?? '';
    $tipoProgramaInicial = strtoupper(substr($tipoPrograma, 0, 1));

    // 3. Inicial de Área
    $area = $curso->area->descripcion ?? '';
    $areaInicial = strtoupper(substr($area, 0, 1));

    // 4. Inicial de Nivel
    $nivel = $curso->nivel->descripcion ?? '';
    $nivelInicial = strtoupper(substr($nivel, 0, 1));

    // 5. Inicial de Grupo
    $grupo = $curso->grupo->descripcion ?? '';
    $grupoInicial = strtoupper(substr($grupo, 0, 1));

    // 6. Las primeras 4 letras del nombre del curso
    $nombreCurso = $curso->descripcion;
    $nombreCursoPrefix = strtoupper(substr($nombreCurso, 0, 4));

    // Concatenar todo para formar el código
    return $modalidadInicial . $tipoProgramaInicial . $areaInicial . $nivelInicial . $grupoInicial . $nombreCursoPrefix;
}


}
