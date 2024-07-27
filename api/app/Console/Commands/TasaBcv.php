<?php

namespace App\Console\Commands;

use App\Http\Controllers\BcvController;
use Carbon\Carbon;
use Illuminate\Console\Command;

class TasaBcv extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:bcv';


    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Guarda Tasa Bcv';
    

    /**
     * Create a new command instance.
     *
     * @return void
     */

     
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Establecer la zona horaria a Caracas
        $now = Carbon::now('America/Caracas');

        // Verificar si la hora actual es 17:45
        if ($now->format('H:i') === '18:10') {
            $controller = new BcvController();
            $controller->savePrecioActual();
            $this->info('Precio del BCV guardado a las 17:45 hora de Caracas');
        } else {
            $this->info('No es la hora programada. La hora actual es: ' . $now->format('H:i'));
        }
    }

    
}
