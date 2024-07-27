<!DOCTYPE html>
<html>
<head>
    <title>Precio del Dólar BCV</title>
</head>
<body>
    <h1>Precio del Dólar BCV</h1>
    @if (isset($dolarBcv) && isset($createdAt))
        <p>El precio actual del dólar es: {{ $dolarBcv }}</p>
        <p>Fecha y hora de la última actualización: {{ $createdAt }}</p>
    @else
        <p>{{ $error }}</p>
    @endif
</body>
</html>
