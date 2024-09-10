import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const userRole = localStorage.getItem('role'); // Obtener el rol del usuario desde localStorage

    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />; // Redirigir si no tiene permiso
    }

    return children; // Mostrar el componente si tiene permiso
};

export default ProtectedRoute;