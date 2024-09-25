<?php
namespace App\Http\Controllers;

use App\Models\Peticiones as Model;
use App\Models\Peticiones;
use Illuminate\Http\Request;

class PeticionesController extends Controller
{
    use ApiResourceTrait, ApiCrudTrait;

    protected $class = Model::class;
    public function index(Request $request)
    {
        return response()->json(

            
            $this->list(
                $this->class,
                $request
            )


        );
        
    }

    public function list($modelClass, Request $request)
{
    // Incluimos las relaciones necesarias
    return $modelClass::with(['user', 'zonas', 'userSuccess'])->paginate(20);
}

}
