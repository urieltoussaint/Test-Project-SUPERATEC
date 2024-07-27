<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use App\Http\Controllers\BcvController;

use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\TasaBcv::class
        
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
   // protected function schedule(Schedule $schedule)
    //{
      //  $schedule->call(function () {
        //    $controller = new BcvController();
          //  $controller->savePrecioActual();
        //})->dailyAt('17:01');
    //}
    protected function schedule(Schedule $schedule)
{
    $schedule->command('test:bcv')->everyMinute();
}

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
