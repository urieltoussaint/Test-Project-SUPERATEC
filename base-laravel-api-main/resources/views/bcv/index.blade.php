<!DOCTYPE html>
<html>
<head>
    <title>Precio del Dólar BCV</title>
</head>
<body>
    <h1>Precio del Dólar BCV</h1>
    @if (isset($dolarBcv))
        <p>El precio actual del dólar es: {{ $dolarBcv }}</p>
    @else
        <p>{{ $error }}</p>
    @endif
</body>
</html>
