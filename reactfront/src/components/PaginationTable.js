import React from 'react';
import { Button, Table } from 'react-bootstrap';

const PaginationTable = ({ data = [], itemsPerPage, columns, renderItem, currentPage, onPageChange }) => {
    // Asegura que data sea un array
    if (!Array.isArray(data)) {
        console.warn('Expected data to be an array but received:', data);
        data = []; // Falla seguro: establece data como un array vacío
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const visiblePageRange = 3;
    const startPage = Math.max(1, currentPage - Math.floor(visiblePageRange / 2));
    const endPage = Math.min(totalPages, startPage + visiblePageRange - 1);

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
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
                    {currentItems.map(renderItem)}
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
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <Button
                            className="page-link"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
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
