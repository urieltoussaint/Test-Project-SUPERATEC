<?php
namespace App\Http\Controllers;
use Symfony\Component\BrowserKit\HttpBrowser;
use Symfony\Component\HttpClient\HttpClient;
use App\Models\TasaBcv;
use App\Models\TasaBcv as Model;
use Illuminate\Http\Request;

class TasaBcvController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;


    public function getPrecioActual()
    {
        try {
            
$client = new HttpBrowser(HttpClient::create([
    'verify_peer' => false,
]));
            // $client = new HttpBrowser(HttpClient::create());
            $crawler = $client->request('GET', 'https://www.bcv.org.ve/');

            // Seleccionar componente de ccss
            $price_dolar = $crawler->filter('div#dolar div.field-content div.recuadrotsmc div.centrado')->first();
            $dolarBcv = $price_dolar->text();

            // Reemplazar comas por puntos
            $dolarBcv = str_replace(',', '.', $dolarBcv);

            // Guardar la tasa en la base de datos
            $tasaBcv = TasaBcv::create(['tasa' => $dolarBcv]);

            // Recuperar el último registro insertado
            $ultimoRegistro = TasaBcv::latest()->first();

            // Pasar los datos a la vista
            // return view('bcv.index', [
            //     'dolarBcv' => $ultimoRegistro->tasa,
            //     'createdAt' => $ultimoRegistro->created_at
            // ]);
            return response()->json(['message' => 'Tasa guardada correctamente'], 200);
        } catch (\Exception $e) {
            return view('bcv.index', ['error' => 'No se pudo obtener el precio del BCV: ' . $e->getMessage()]);
        }
    }

    // public function savePrecioActual()
    // {
    //     try {
    //         $client = new HttpBrowser(HttpClient::create());
    //         $crawler = $client->request('GET', 'https://www.bcv.org.ve/');

    //         // Seleccionar componente de ccss
    //         $price_dolar = $crawler->filter('div#dolar div.field-content div.recuadrotsmc div.centrado')->first();
    //         $dolarBcv = $price_dolar->text();

    //         // Reemplazar comas por puntos
    //         $dolarBcv = str_replace(',', '.', $dolarBcv);

    //         // Guardar la tasa en la base de datos
    //         TasaBcv::create(['tasa' => $dolarBcv]);

    //         return response()->json(['message' => 'Tasa guardada correctamente'], 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'No se pudo obtener el precio del BCV', 'message' => $e->getMessage()], 500);
    //     }
    // }

    public function getLatestTasa()
{
    $tasaBcv = TasaBcv::orderBy('id', 'desc')->first();
    
    if (!$tasaBcv) {
        return response()->json(['error' => 'Tasa BCV no encontrada'], 404);
    }

    return response()->json([
        'id' => $tasaBcv->id,
        'tasa' => $tasaBcv->tasa,
        'created_at' => $tasaBcv->created_at 
    ]);
}

    public function show($id)
    {
        $tasaBcv = TasaBcv::findOrFail($id);
        return response()->json($tasaBcv);
    }


    public function GetBcvFecha(Request $request)
{
    try {
        // Validar que se envíe fecha_pago en la solicitud
        $request->validate([
            'fecha_pago' => 'required|date'
        ]);

        // Buscar la tasa BCV que coincida con la fecha proporcionada
        $tasaBcv = TasaBcv::whereDate('created_at', $request->fecha_pago)->first();

        // Si no se encuentra, devolver un error
        if (!$tasaBcv) {
            return response()->json([
                'error' => 'No se encontró una tasa BCV para la fecha especificada.'
            ], 404);
        }

        // Devolver la tasa encontrada
        return response()->json([
            'id' => $tasaBcv->id,
            'tasa' => $tasaBcv->tasa,
            'fecha' => $tasaBcv->created_at
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Error al obtener la tasa BCV: ' . $e->getMessage()
        ], 500);
    }
}

}
