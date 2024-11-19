<?php
namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Centro;
use App\Models\ComoEnteroSuperatec;
use App\Models\Genero;
use App\Models\InformacionVoluntariados;
use App\Models\Nivel;
use App\Models\NivelInstruccion;
use App\Models\PersonalesVoluntariados as Model;
use App\Models\PersonalesVoluntariados;
use App\Models\Procedencia;
use App\Models\TipoVoluntariado;
use App\Models\Turnos;
use Illuminate\Http\Request;

class PersonalesVoluntariadosController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;

    

    public function store(Request $request)
    {
        // Crear primero el Patrocinante
        $personales_voluntariados = $this->new($this->class, $request);

        // Luego crear ContactoPatrocinante y asignar el id del patrocinante
        $informacion_voluntariados = new InformacionVoluntariados($request->all());
        $informacion_voluntariados->voluntariado_id = $personales_voluntariados->id; // Asignar el id del patrocinante recién creado
        $informacion_voluntariados->save();

        // Retornar la respuesta
        return response()->json([
            'personales_voluntariados' => $personales_voluntariados,
            'informacion_voluntariados' => $informacion_voluntariados
        ], 201);
    }
    

    public function getDatos($id) {
        $datos = PersonalesVoluntariados::with('InformacionVoluntariados')->find($id);
        return response()->json($datos);
    }

    public function update($id, Request $request)
    {
        // Editar el patrocinante existente
        $personales_voluntariados = $this->edit($this->class::findOrFail($id), $request);
    
        // Actualizar el contacto vinculado
        $informacion_voluntariados = InformacionVoluntariados::where('voluntariado_id', $personales_voluntariados->id)->first();
        if ($informacion_voluntariados) {
            $informacion_voluntariados->update($request->all());
        }
    
        return response()->json([
            'personales_voluntariados' => $personales_voluntariados,
            'informacion_voluntariados' => $informacion_voluntariados
        ]);
    }

    public function searchByCedula1($cedula_identidad)
    {
        $dato = PersonalesVoluntariados::where('cedula_identidad', $cedula_identidad)->first();
    
        if (!$dato) {
            return response()->json(['message' => 'No se encontró la cédula'], 404);
        }
    
        return response()->json($dato);
    }


    public function fetchFilterOptions()
    {
            $centro = Centro::all();
            $area = Area::all();
            $nivel = NivelInstruccion::all();
            $genero= Genero::all();
            $procedencia= Procedencia::all();
            $turno=Turnos::all();
            $superatec=ComoEnteroSuperatec::all();
            $tipo=TipoVoluntariado::all();

            return response()->json([
                'area' => $area,
                'centro' => $centro,
                'nivel' =>$nivel,
                'genero'=>$genero,
                'procedencia'=>$procedencia,
                'turno'=>$turno,
                'superatec'=>$superatec,
                'tipo'=>$tipo
            ]);
    } 



    public function getVoluntariadosWithStatistics(Request $request)
{
    // 1. Consulta para obtener los datos paginados que se mostrarán en la tabla
    $queryPaginated = PersonalesVoluntariados::query()
        ->with([
            'nivelInstruccion',
            'genero',
            'InformacionVoluntariados',
            'InformacionVoluntariados.centro',
            'InformacionVoluntariados.area'
        ])
        ->orderBy('id', 'desc'); // Ordena por id de forma descendente para mostrar los últimos primero

    // Aplicar filtros
    if ($request->filled('nivel_instruccion_id')) {
        $queryPaginated->where('nivel_instruccion_id', $request->nivel_instruccion_id);
    }
    if ($request->filled('genero_id')) {
        $queryPaginated->where('genero_id', $request->genero_id);
    }
    if ($request->filled('cedula_identidad')) {
        $queryPaginated->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
    }
    if ($request->filled('area_voluntariado_id')) {
        $queryPaginated->whereHas('InformacionVoluntariados.area', function ($query) use ($request) {
            $query->where('id', $request->area_voluntariado_id);
        });
    }
    if ($request->filled('centro_id')) {
        $queryPaginated->whereHas('InformacionVoluntariados.centro', function ($query) use ($request) {
            $query->where('id', $request->centro_id);
        });
    }

    // Obtener los datos paginados para mostrar en la tabla
    $datosPaginados = $queryPaginated->paginate(9);

    // 2. Consulta para obtener todos los datos filtrados (sin paginación) para las estadísticas
    $queryStatistics = PersonalesVoluntariados::query()
        ->with([
            'nivelInstruccion',
            'genero',
            'InformacionVoluntariados',
            'InformacionVoluntariados.centro',
            'InformacionVoluntariados.area'
        ]);

    // Aplicar los mismos filtros que en la consulta paginada
    if ($request->filled('nivel_instruccion_id')) {
        $queryStatistics->where('nivel_instruccion_id', $request->nivel_instruccion_id);
    }
    if ($request->filled('genero_id')) {
        $queryStatistics->where('genero_id', $request->genero_id);
    }
    if ($request->filled('cedula_identidad')) {
        $queryStatistics->where('cedula_identidad', 'LIKE', "%{$request->cedula_identidad}%");
    }
    if ($request->filled('area_voluntariado_id')) {
        $queryStatistics->whereHas('InformacionVoluntariados.area', function ($query) use ($request) {
            $query->where('id', $request->area_voluntariado_id);
        });
    }
    if ($request->filled('centro_id')) {
        $queryStatistics->whereHas('InformacionVoluntariados.centro', function ($query) use ($request) {
            $query->where('id', $request->centro_id);
        });
    }

    // Obtener todos los datos filtrados para las estadísticas sin paginación
    $datosParaEstadisticas = $queryStatistics->get();

    // Calcular estadísticas generales en todos los datos filtrados
    $totalVoluntariados = $datosParaEstadisticas->count();

    // Calcular porcentajes de género
    $totalMasculino = $datosParaEstadisticas->where('genero_id', 1)->count();
    $totalFemenino = $datosParaEstadisticas->where('genero_id', 3)->count();
    $totalOtros = $datosParaEstadisticas->where('genero_id', 2)->count();
    $porcentajeMasculino = $totalVoluntariados > 0 ? ($totalMasculino / $totalVoluntariados) * 100 : 0;
    $porcentajeFemenino = $totalVoluntariados > 0 ? ($totalFemenino / $totalVoluntariados) * 100 : 0;
    $porcentajeOtros = $totalVoluntariados > 0 ? ($totalOtros / $totalVoluntariados) * 100 : 0;

    // Agrupar y calcular estadísticas adicionales
    $nivelesInstruccion = $datosParaEstadisticas->groupBy('nivelInstruccion.descripcion')->map(function ($group) use ($totalVoluntariados) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalVoluntariados > 0 ? ($count / $totalVoluntariados) * 100 : 0
        ];
    });

    $participantesPorArea = $datosParaEstadisticas->groupBy('InformacionVoluntariados.area.descripcion')->map(function ($group) use ($totalVoluntariados) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalVoluntariados > 0 ? ($count / $totalVoluntariados) * 100 : 0
        ];
    });

    $centro = $datosParaEstadisticas->groupBy('InformacionVoluntariados.centro.descripcion')->map(function ($group) use ($totalVoluntariados) {
        $count = $group->count();
        return [
            'count' => $count,
            'percentage' => $totalVoluntariados > 0 ? ($count / $totalVoluntariados) * 100 : 0
        ];
    });

    // Retornar los datos paginados y las estadísticas completas
    return response()->json([
        'datos' => $datosPaginados,
        'estadisticas' => [
            'totalVoluntariados' => $totalVoluntariados,
            'porcentajesGenero' => [
                'masculino' => $porcentajeMasculino,
                'femenino' => $porcentajeFemenino,
                'otros' => $porcentajeOtros,
            ],
            'nivelesInstruccion' => $nivelesInstruccion,
            'centro' => $centro,
            'participantesPorArea' => $participantesPorArea,
        ],
    ]);
}


}


