<?php

namespace App\Http\Middleware;

use Closure;

class GetToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        return $next($request);
    }

    function getToken($tokenString)
    {
        $raw = explode(".", $tokenString);

        return (object) [
            "headers" => json_decode(base64_decode($raw[0])),
            "payload" => json_decode(base64_decode($raw[1])),
            // "signature" => base64_decode($raw[2]),
        ];
    }
}
