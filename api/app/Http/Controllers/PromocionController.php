<?php
namespace App\Http\Controllers;

use App\Models\Centro;
use App\Models\Cohorte;
use App\Models\Mencion;
use App\Models\Periodo;
use App\Models\Procedencia;
use App\Models\Promocion as Model;

class PromocionController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;



    public function fetchFilterOptions()
    {
       
            $centro = Centro::all();
            $periodo = Periodo::all();
            $cohorte = Cohorte::all();
            $mencion= Mencion::all();
            $procedencia= Procedencia::all();
    
            return response()->json([
                'periodo' => $periodo,
                'centro' => $centro,
                'cohorte' =>$cohorte,
                'mencion'=>$mencion,
                'procedencia'=>$procedencia,
            ]);
        
    } 

}
