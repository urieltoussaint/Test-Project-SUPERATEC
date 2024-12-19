<?php
namespace App\Http\Controllers;

use App\Models\ContactoPatrocinante;
use App\Models\Estado;
use App\Models\Pais;
use App\Models\Patrocinante as Model;
use App\Models\Patrocinante;
use App\Models\TipoIndustria;
use App\Models\TipoPatrocinante;
use Illuminate\Http\Request;

class PatrocinanteController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


    public function store(Request $request)
    {
        // Crear primero el Patrocinante
        $patrocinante = $this->new($this->class, $request);

        // Luego crear ContactoPatrocinante y asignar el id del patrocinante
        $contacto_patrocinante = new ContactoPatrocinante($request->all());
        $contacto_patrocinante->patrocinante_id = $patrocinante->id; // Asignar el id del patrocinante recién creado
        $contacto_patrocinante->save();

        // Retornar la respuesta
        return response()->json([
            'patrocinante' => $patrocinante,
            'contacto_patrocinante' => $contacto_patrocinante
        ], 201);
    }

    public function getPatrocinante($id) {
        $datos = Patrocinante::with('contactoPatrocinante')->find($id);
        return response()->json($datos);
    }

    public function getPatrocinantesWithStatistics(Request $request)
    {
        // 1. Consulta para obtener los datos paginados que se mostrarán en la tabla
        $queryPaginated = Patrocinante::query()
            ->with(['contactoPatrocinante', 'tipoIndustria', 'tipoPatrocinante', 'estado', 'pais'])
            ->orderBy('id', 'desc'); // Ordena por id de forma descendente para mostrar los últimos primero
    
        // Aplicar filtros a la consulta paginada
        if ($request->filled('tipo_industria_id')) {
            $queryPaginated->where('tipo_industria_id', $request->tipo_industria_id);
        }
        if ($request->filled('tipo_patrocinante_id')) {
            $queryPaginated->where('tipo_patrocinante_id', $request->tipo_patrocinante_id);
        }
        if ($request->filled('pais_id')) {
            $queryPaginated->where('pais_id', $request->pais_id);
        }
        if ($request->filled('estado_id')) {
            $queryPaginated->where('estado_id', $request->estado_id);
        }
        if ($request->filled('empresa_persona')) {
            $queryPaginated->where('empresa_persona', $request->empresa_persona);
        }
        if ($request->filled('rif_cedula')) {
            $queryPaginated->where('rif_cedula', 'LIKE', "%{$request->rif_cedula}%");
        }
        if ($request->filled('es_patrocinante')) {
            $queryPaginated->where('es_patrocinante', $request->es_patrocinante);
        }
        if ($request->filled('bolsa_empleo')) {
            $queryPaginated->where('bolsa_empleo', $request->bolsa_empleo);
        }
        if ($request->filled('exterior')) {
            $queryPaginated->where('exterior', $request->exterior);
        }
        
        // Obtener los datos paginados para mostrar en la tabla
        $datosPaginados = $queryPaginated->paginate(9);
    
        // 2. Consulta para obtener todos los datos filtrados (sin paginación) para las estadísticas
        $queryStatistics = Patrocinante::query();
    
        // Aplicar filtros a la consulta para estadísticas
        if ($request->filled('tipo_industria_id')) {
            $queryStatistics->where('tipo_industria_id', $request->tipo_industria_id);
        }
        if ($request->filled('tipo_patrocinante_id')) {
            $queryStatistics->where('tipo_patrocinante_id', $request->tipo_patrocinante_id);
        }
        if ($request->filled('pais_id')) {
            $queryStatistics->where('pais_id', $request->pais_id);
        }
        if ($request->filled('estado_id')) {
            $queryStatistics->where('estado_id', $request->estado_id);
        }
        if ($request->filled('empresa_persona')) {
            $queryStatistics->where('empresa_persona', $request->empresa_persona);
        }
        if ($request->filled('rif_cedula')) {
            $queryStatistics->where('rif_cedula', 'LIKE', "%{$request->rif_cedula}%");
        }
        if ($request->filled('es_patrocinante')) {
            $queryStatistics->where('es_patrocinante', $request->es_patrocinante);
        }
        if ($request->filled('bolsa_empleo')) {
            $queryStatistics->where('bolsa_empleo', $request->bolsa_empleo);
        }
        if ($request->filled('exterior')) {
            $queryStatistics->where('exterior', $request->exterior);
        }
    
        // Obtener todos los datos filtrados para las estadísticas sin paginación
        $datosParaEstadisticas = $queryStatistics->with(['contactoPatrocinante', 'tipoIndustria', 'tipoPatrocinante', 'estado', 'pais'])->get();
    
        // Calcular estadísticas generales en todos los datos filtrados
        $totalPatrocinantes = $datosParaEstadisticas->count();
    
        // Calcular porcentajes de empresa y persona
        $totalEmpresa = $datosParaEstadisticas->where('empresa_persona', "Empresa")->count();
        $totalPersona = $datosParaEstadisticas->where('empresa_persona', "Persona")->count();
        $porcentajeEmpresa = $totalPatrocinantes > 0 ? ($totalEmpresa / $totalPatrocinantes) * 100 : 0;
        $porcentajePersona = $totalPatrocinantes > 0 ? ($totalPersona / $totalPatrocinantes) * 100 : 0;
    
        // Calcular cantidad y porcentaje de exterior y no exterior
        $totalExterior = $datosParaEstadisticas->where('exterior', true)->count();
        $totalNoExterior = $datosParaEstadisticas->where('exterior', false)->count();
        $porcentajeExterior = $totalPatrocinantes > 0 ? ($totalExterior / $totalPatrocinantes) * 100 : 0;
        $porcentajeNoExterior = $totalPatrocinantes > 0 ? ($totalNoExterior / $totalPatrocinantes) * 100 : 0;
    
        // Calcular cantidad y porcentaje de es_patrocinado (si y no)
        $totalSiPatrocinado = $datosParaEstadisticas->where('es_patrocinante', true)->count();
        $totalNoPatrocinado = $datosParaEstadisticas->where('es_patrocinante', false)->count();
        $porcentajeSiPatrocinado = $totalPatrocinantes > 0 ? ($totalSiPatrocinado / $totalPatrocinantes) * 100 : 0;
        $porcentajeNoPatrocinado = $totalPatrocinantes > 0 ? ($totalNoPatrocinado / $totalPatrocinantes) * 100 : 0;
    
        // Calcular cantidad y porcentaje de bolsa_empleo (si y no)
        $totalBolsaEmpleoSi = $datosParaEstadisticas->where('bolsa_empleo', true)->count();
        $totalBolsaEmpleoNo = $datosParaEstadisticas->where('bolsa_empleo', false)->count();
        $porcentajeBolsaEmpleoSi = $totalPatrocinantes > 0 ? ($totalBolsaEmpleoSi / $totalPatrocinantes) * 100 : 0;
        $porcentajeBolsaEmpleoNo = $totalPatrocinantes > 0 ? ($totalBolsaEmpleoNo / $totalPatrocinantes) * 100 : 0;
    
        // Agrupar por tipoIndustria, tipoPatrocinante, pais, y estado para estadísticas
        $tipoIndustria = $datosParaEstadisticas->groupBy('tipoIndustria.descripcion')->map(function ($group) use ($totalPatrocinantes) {
            $count = $group->count();
            return [
                'count' => $count,
                'percentage' => $totalPatrocinantes > 0 ? ($count / $totalPatrocinantes) * 100 : 0
            ];
        });
    
        $tipoPatrocinante = $datosParaEstadisticas->groupBy('tipoPatrocinante.descripcion')->map(function ($group) use ($totalPatrocinantes) {
            $count = $group->count();
            return [
                'count' => $count,
                'percentage' => $totalPatrocinantes > 0 ? ($count / $totalPatrocinantes) * 100 : 0
            ];
        });
    
        $pais = $datosParaEstadisticas->groupBy('pais.descripcion')->map(function ($group) use ($totalPatrocinantes) {
            $count = $group->count();
            return [
                'count' => $count,
                'percentage' => $totalPatrocinantes > 0 ? ($count / $totalPatrocinantes) * 100 : 0
            ];
        });
    
        $estado = $datosParaEstadisticas->groupBy('estado.descripcion')->map(function ($group) use ($totalPatrocinantes) {
            $count = $group->count();
            return [
                'count' => $count,
                'percentage' => $totalPatrocinantes > 0 ? ($count / $totalPatrocinantes) * 100 : 0
            ];
        });
    
        // Retornar los datos paginados y las estadísticas completas
        return response()->json([
            'datos' => $datosPaginados,
            'estadisticas' => [
                'totalPatrocinantes' => $totalPatrocinantes,
                'porcentajesTipo' => [
                    'Empresa' => $porcentajeEmpresa,
                    'Persona' => $porcentajePersona,
                ],
                'exterior' => [
                    'Exterior' => $totalExterior,
                    'NoExterior' => $totalNoExterior,
                ],
                'esPatrocinado' => [
                    'Si' => $porcentajeSiPatrocinado,
                    'No' => $porcentajeNoPatrocinado,
                ],
                'bolsaEmpleo' => [
                    'Si' => $porcentajeBolsaEmpleoSi,
                    'No' => $porcentajeBolsaEmpleoNo,
                ],
                'tipoIndustria' => $tipoIndustria,
                'tipoPatrocinante' => $tipoPatrocinante,
                'pais' => $pais,
                'estado' => $estado,
            ],
        ]);
    }
    

    public function getPatrocinantes(Request $request)
    {
        // 1. Consulta para obtener los datos paginados que se mostrarán en la tabla
        $queryPaginated = Patrocinante::query()
            ->orderBy('id', 'desc'); // Ordena por id de forma descendente para mostrar los últimos primero
    
        // Aplicar filtros a la consulta paginada
        
        if ($request->filled('rif_cedula')) {
            $queryPaginated->where('rif_cedula', 'LIKE', "%{$request->rif_cedula}%");
        }
        if ($request->filled('nombre_patrocinante')) {
            $queryPaginated->where('nombre_patrocinante', 'ILIKE', "%{$request->nombre_patrocinante}%");
        }
      
        
        // Obtener los datos paginados para mostrar en la tabla
        $datosPaginados = $queryPaginated->paginate(9);
    
        // Retornar los datos paginados y las estadísticas completas
        return response()->json([
            'patrocinantes' => $datosPaginados,
           
        ]);
    }
    








    public function update($id, Request $request)
{
    // Editar el patrocinante existente
    $patrocinante = $this->edit($this->class::findOrFail($id), $request);

    // Actualizar el contacto vinculado
    $contacto_patrocinante = ContactoPatrocinante::where('patrocinante_id', $patrocinante->id)->first();
    if ($contacto_patrocinante) {
        $contacto_patrocinante->update($request->all());
    }

    return response()->json([
        'patrocinante' => $patrocinante,
        'contacto_patrocinante' => $contacto_patrocinante
    ]);
}

    public function searchByRifCedula($rif_cedula)
    {
        $dato = Patrocinante::where('rif_cedula', $rif_cedula)->first();
    
        if (!$dato) {
            return response()->json(['message' => 'No se encontró el rif/cedula'], 404);
        }
    
        return response()->json($dato);
    }


    public function fetchFilterOptions()
{
   
        $pais = Pais::all();
        $estados = Estado::all();
        $tipo_industria = TipoIndustria::all();
        $tipo_patrocinante= TipoPatrocinante::all();

        return response()->json([
            'estado' => $estados,
            'pais' => $pais,
            'tipo_industria' =>$tipo_industria,
            'tipo_patrocinante'=>$tipo_patrocinante,
        ]);
    
} 


}
