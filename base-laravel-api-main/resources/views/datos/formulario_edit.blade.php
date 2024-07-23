<!DOCTYPE html>
<html>
<head>
    <title>Editar Datos de Identificación</title>
</head>
<body>
    @if (session('success'))
        <p>{{ session('success') }}</p>
    @endif

    @if ($errors->any())
        <div>
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('datos.update', $dato->cedula_identidad) }}" method="POST">
        @csrf
        @method('PUT')

        <label for="cedula_identidad">Cédula de Identidad:</label>
        <input type="text" id="cedula_identidad" name="cedula_identidad" value="{{ $dato->cedula_identidad }}" readonly><br>

        <label for="status_seleccion_id">Status Selección:</label>
        <select id="status_seleccion_id" name="status_seleccion_id">
            @foreach ($statusSeleccion as $status)
                <option value="{{ $status->id }}" {{ $dato->status_seleccion_id == $status->id ? 'selected' : '' }}>{{ $status->descripcion }}</option>
            @endforeach
        </select><br>

        <label for="nacionalidad_id">Nacionalidad:</label>
        <select id="nacionalidad_id" name="nacionalidad_id">
            @foreach ($nacionalidades as $nacionalidad)
                <option value="{{ $nacionalidad->id }}" {{ $dato->nacionalidad_id == $nacionalidad->id ? 'selected' : '' }}>{{ $nacionalidad->descripcion }}</option>
            @endforeach
        </select><br>

        <label for="nombres">Nombres:</label>
        <input type="text" id="nombres" name="nombres" value="{{ $dato->nombres }}" required><br>

        <label for="apellidos">Apellidos:</label>
        <input type="text" id="apellidos" name="apellidos" value="{{ $dato->apellidos }}" required><br>

        <label for="fecha_nacimiento">Fecha de Nacimiento:</label>
        <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" value="{{ $dato->fecha_nacimiento }}" required><br>

        <label for="edad">Edad:</label>
        <input type="number" id="edad" name="edad" value="{{ $dato->edad }}" required><br>

        <label for="genero_id">Género:</label>
        <select id="genero_id" name="genero_id">
            @foreach ($generos as $genero)
                <option value="{{ $genero->id }}" {{ $dato->genero_id == $genero->id ? 'selected' : '' }}>{{ $genero->descripcion }}</option>
            @endforeach
        </select><br>

        <label for="grupo_prioritario_id">Grupo Prioritario:</label>
        <select id="grupo_prioritario_id" name="grupo_prioritario_id">
            @foreach ($gruposPrioritarios as $grupo)
                <option value="{{ $grupo->id }}" {{ $dato->grupo_prioritario_id == $grupo->id ? 'selected' : '' }}>{{ $grupo->descripcion }}</option>
            @endforeach
        </select><br>

        <label for="direccion">Dirección:</label>
        <textarea id="direccion" name="direccion" required>{{ $dato->direccion }}</textarea><br>

        <label for="estado_id">Estado:</label>
        <select id="estado_id" name="estado_id">
            @foreach ($estados as $estado)
                <option value="{{ $estado->id }}" {{ $dato->estado_id == $estado->id ? 'selected' : '' }}>{{ $estado->descripcion }}</option>
            @endforeach
        </select><br>

        <label for="direccion_email">Dirección Email:</label>
        <input type="email" id="direccion_email" name="direccion_email" value="{{ $dato->direccion_email }}" required><br>

        <label for="procedencia_id">Procedencia:</label>
        <select id="procedencia_id" name="procedencia_id">
            @foreach ($procedencias as $procedencia)
                <option value="{{ $procedencia->id }}" {{ $dato->procedencia_id == $procedencia->id ? 'selected' : '' }}>{{ $procedencia->descripcion }}</option>
            @endforeach
        </select><br>

        <label for="telefono_casa">Teléfono de Casa:</label>
        <input type="text" id="telefono_casa" name="telefono_casa" value="{{ $dato->telefono_casa }}"><br>

        <label for="telefono_celular">Teléfono Celular:</label>
        <input type="text" id="telefono_celular" name="telefono_celular" value="{{ $dato->telefono_celular }}"><br>

        <label for="nivel_instruccion_id">Nivel de Instrucción:</label>
        <select id="nivel_instruccion_id" name="nivel_instruccion_id">
            @foreach ($nivelesInstruccion as $nivel)
                <option value="{{ $nivel->id }}" {{ $dato->nivel_instruccion_id == $nivel->id ? 'selected' : '' }}>{{ $nivel->descripcion }}</option>
            @endforeach
        </select><br>

        <button type="submit">Actualizar</button>
    </form>
</body>
</html>
