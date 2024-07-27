<!DOCTYPE html>
<html>
<head>
    <title>Lista de Datos Registrados</title>
</head>
<body>
    @if (session('success'))
        <p>{{ session('success') }}</p>
    @endif

    <h1>Lista de Datos Registrados</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Cédula</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Status</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($datos as $dato)
            <tr>
                <td>{{ $dato->cedula_identidad }}</td>
                <td>{{ $dato->nombres }}</td>
                <td>{{ $dato->apellidos }}</td>
                <td>{{ $dato->statusSeleccion->descripcion }}</td>
                <td>
                    <a href="{{ route('datos.show', $dato->cedula_identidad) }}">Ver más</a>
                    <a href="{{ route('datos.edit', $dato->cedula_identidad) }}">Editar</a>
                    <form action="{{ route('datos.destroy', $dato->cedula_identidad) }}" method="POST" style="display:inline-block;">
                        @csrf
                        @method('DELETE')
                        <button type="submit">Eliminar</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <a href="{{ route('formulario.create') }}">Agregar Nuevo Registro</a>
</body>
</html>
