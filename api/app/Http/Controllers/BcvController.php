<?php

namespace App\Http\Controllers;

use Symfony\Component\BrowserKit\HttpBrowser;
use Symfony\Component\HttpClient\HttpClient;
use Illuminate\Http\Request;
use App\Models\TasaBcv;

class BcvController extends Controller
{
    public function getPrecioActual()
    {
        try {
            $client = new HttpBrowser(HttpClient::create());
            $crawler = $client->request('GET', 'http://www.bcv.org.ve/');

            // Asegúrate de que el selector CSS sea correcto
            $price_dolar = $crawler->filter('div#dolar div.field-content div.recuadrotsmc div.centrado')->first();
            $dolarBcv = $price_dolar->text();

            // Reemplazar comas por puntos
            $dolarBcv = str_replace(',', '.', $dolarBcv);

            // Guardar la tasa en la base de datos
            $tasaBcv = TasaBcv::create(['tasa' => $dolarBcv]);

            // Recuperar el último registro insertado
            $ultimoRegistro = TasaBcv::latest()->first();

            // Pasar los datos a la vista
            return view('bcv.index', [
                'dolarBcv' => $ultimoRegistro->tasa,
                'createdAt' => $ultimoRegistro->created_at
            ]);
        } catch (\Exception $e) {
            return view('bcv.index', ['error' => 'No se pudo obtener el precio del BCV: ' . $e->getMessage()]);
        }
    }

    public function savePrecioActual()
    {
        try {
            $client = new HttpBrowser(HttpClient::create());
            $crawler = $client->request('GET', 'http://www.bcv.org.ve/');

            // Asegúrate de que el selector CSS sea correcto
            $price_dolar = $crawler->filter('div#dolar div.field-content div.recuadrotsmc div.centrado')->first();
            $dolarBcv = $price_dolar->text();

            // Reemplazar comas por puntos
            $dolarBcv = str_replace(',', '.', $dolarBcv);

            // Guardar la tasa en la base de datos
            TasaBcv::create(['tasa' => $dolarBcv]);

            return response()->json(['message' => 'Tasa guardada correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo obtener el precio del BCV', 'message' => $e->getMessage()], 500);
        }
    }
}
