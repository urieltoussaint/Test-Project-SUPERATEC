<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DatosIdentificacionController;

// routes/api.php




// routes/api.php


// Route::middleware('api')->group(function () {
//     Route::post('/datos', [DatosIdentificacionController::class, 'store']);
    


// });

Route::apiResources([
    'datos' => \App\Http\Controllers\DatosIdentificacionController::class,
]);
