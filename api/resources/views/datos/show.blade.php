<!DOCTYPE html>
<html>
<head>
    <title>Detalle de Datos de Identificación</title>
</head>
<body>
    <h1>Datos de Identificación</h1>
    <p><strong>Cédula de Identidad:</strong> {{ $dato->cedula_identidad }}</p>
    <p><strong>Status Selección:</strong> {{ $dato->statusSeleccion->descripcion ?? 'No especificado' }}</p>
    <p><strong>Nacionalidad:</strong> {{ $dato->nacionalidad->descripcion ?? 'No especificado' }}</p>
    <p><strong>Nombres:</strong> {{ $dato->nombres }}</p>
    <p><strong>Apellidos:</strong> {{ $dato->apellidos }}</p>
    <p><strong>Fecha de Nacimiento:</strong> {{ $dato->fecha_nacimiento }}</p>
    <p><strong>Edad:</strong> {{ $dato->edad }}</p>
    <p><strong>Género:</strong> {{ $dato->genero->descripcion ?? 'No especificado' }}</p>
    <p><strong>Grupo Prioritario:</strong> {{ $dato->grupoPrioritario->descripcion ?? 'No especificado' }}</p>
    <p><strong>Dirección:</strong> {{ $dato->direccion }}</p>
    <p><strong>Fecha Actual:</strong> {{ $dato->fecha_actual }}</p>
    <p><strong>Estado:</strong> {{ $dato->estado->descripcion ?? 'No especificado' }}</p>
    <p><strong>Dirección Email:</strong> {{ $dato->direccion_email }}</p>
    <p><strong>Procedencia:</strong> {{ $dato->procedencia->descripcion ?? 'No especificado' }}</p>
    <p><strong>Teléfono de Casa:</strong> {{ $dato->telefono_casa }}</p>
    <p><strong>Teléfono Celular:</strong> {{ $dato->telefono_celular }}</p>
    <p><strong>Nivel de Instrucción:</strong> {{ $dato->nivelInstruccion->descripcion ?? 'No especificado' }}</p>
    <p><strong>Número de Documento:</strong> {{ $dato->nro_documento }}</p>

    <h1>Información de Inscripción</h1>
    <p><strong>¿Cómo se enteró de SUPERATEC?:</strong> {{ $inscripcion->comoEnteroSuperatec->descripcion ?? 'No especificado' }}</p>
    <p><strong>Cohorte:</strong> {{ $inscripcion->cohorte->descripcion ?? 'No especificado' }}</p>
    <p><strong>Centro:</strong> {{ $inscripcion->centro->descripcion ?? 'No especificado' }}</p>
    <p><strong>Periodo:</strong> {{ $inscripcion->periodo->descripcion ?? 'No especificado' }}</p>
    <p><strong>Fecha de Inscripción:</strong> {{ $inscripcion->fecha_inscripcion }}</p>
    <p><strong>Área:</strong> {{ $inscripcion->area->descripcion ?? 'No especificado' }}</p>
    <p><strong>Unidad:</strong> {{ $inscripcion->unidad->descripcion ?? 'No especificado' }}</p>
    <p><strong>Modalidad:</strong> {{ $inscripcion->modalidad->descripcion ?? 'No especificado' }}</p>
    <p><strong>Nivel:</strong> {{ $inscripcion->nivel->descripcion ?? 'No especificado' }}</p>
    <p><strong>Tipo de Programa:</strong> {{ $inscripcion->tipoPrograma->descripcion ?? 'No especificado' }}</p>
    <p><strong>Realiza Aporte:</strong> {{ $inscripcion->realiza_aporte ? 'Sí' : 'No' }}</p>
    <p><strong>Es Patrocinado:</strong> {{ $inscripcion->es_patrocinado ? 'Sí' : 'No' }}</p>
    <p><strong>Grupo:</strong> {{ $inscripcion->grupo }}</p>
    <p><strong>Observaciones:</strong> {{ $inscripcion->observaciones }}</p>

    <a href="{{ route('datos.index') }}">Volver</a>
</body>
</html>
