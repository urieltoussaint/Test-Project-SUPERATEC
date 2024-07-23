<!DOCTYPE html>
<html>
<head>
    <title>Formulario de Datos de Identificación</title>
</head>
<body>
    @if (session('success'))
        <p>{{ session('success') }}</p>
    @endif

    <form action="{{ route('formulario.store') }}" method="POST">
        @csrf
        <label for="cedula_identidad">Cédula de Identidad:</label>
        <input type="text" id="cedula_identidad" name="cedula_identidad" required><br>

        <label for="status_seleccion_id">Status Selección:</label>
        <select id="status_seleccion_id" name="status_seleccion_id">
            @foreach ($statusSeleccion as $status)
                <option value="{{ $status->id }}">{{ $status->descripcion }}</option>
            @endforeach
        </select><br>

        <label for="nacionalidad_id">Nacionalidad:</label>
        <select id="nacionalidad_id" name="nacionalidad_id">
            @foreach ($nacionalidades as $nacionalidad)
                <option value="{{ $nacionalidad->id }}">{{ $nacionalidad->descripcion }}</option>
            @endforeach
        </select><br>

        <label for="nombres">Nombres:</label>
        <input type="text" id="nombres" name="nombres" required><br>

        <label for="apellidos">Apellidos:</label>
        <input type="text" id="apellidos" name="apellidos" required><br>

        <label for="fecha_nacimiento">Fecha de Nacimiento:</label>
        <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" required><br>

        <label for="edad">Edad:</label>
        <input type="number" id="edad" name="edad" required><br>

        <label for="genero_id">Género:</label>
        <select id="genero_id" name="genero_id">
            @foreach ($generos as $genero)
                <option val
