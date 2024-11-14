import React from 'react';
import { Button, Table } from 'react-bootstrap';

const PaginationTable = ({ data = [], itemsPerPage = 10, columns, renderItem, currentPage, onPageChange, totalPages }) => {
    // Asegura que data sea un array
    if (!Array.isArray(data)) {
        console.warn('Expected data to be an array but received:', data);
        data = []; // Falla seguro: establece data como un array vacío
    }

    // Si `totalPages` no está definido, calculamos el número total de páginas en función de los datos locales
    const calculatedTotalPages = totalPages || Math.ceil(data.length / itemsPerPage);

    // Si `totalPages` no está definido, calculamos `currentItems` aquí
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = totalPages ? data : data.slice(indexOfFirstItem, indexOfLastItem);

    // Configuración de la paginación visible
    const visiblePageRange = 3;
    const startPage = Math.max(1, currentPage - Math.floor(visiblePageRange / 2));
    const endPage = Math.min(calculatedTotalPages, startPage + visiblePageRange - 1);

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < calculatedTotalPages) onPageChange(currentPage + 1);
    };

    return (
        <div>
            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(totalPages ? data : currentItems).map(renderItem)} {/* Renderiza `data` directamente si paginación en servidor */}
                </tbody>
            </Table>

            <nav className="d-flex justify-content-center">
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <Button
                            className="page-link"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                    </li>
                    {pageNumbers.map(number => (
                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                            <Button
                                onClick={() => onPageChange(number)}
                                className="page-link"
                            >
                                {number}
                            </Button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === calculatedTotalPages ? 'disabled' : ''}`}>
                        <Button
                            className="page-link"
                            onClick={handleNextPage}
                            disabled={currentPage === calculatedTotalPages}
                        >
                            Siguiente
                        </Button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default PaginationTable;
