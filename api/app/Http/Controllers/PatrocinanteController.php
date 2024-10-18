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
