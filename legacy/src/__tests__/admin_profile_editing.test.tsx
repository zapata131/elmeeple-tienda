import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminStoreList } from '@/components/AdminStoreList';

const mockStores = [
  {
    id: 'store-mx-01',
    name: 'Ficha y Dado',
    verified: true,
    owner_email: 'contacto@fichaydado.com',
    city: 'Ciudad de México, CDMX',
    address: 'Showroom en CDMX',
    description: 'Tienda en CDMX',
    specialties: ['Euros pesados', 'Preventas'],
  },
];

describe('US-66: Admin Portal Store Profile Editing', () => {
  it('opens inline edit form when Editar perfil is clicked and updates store location/bio upon saving', () => {
    render(<AdminStoreList initialStores={mockStores} />);

    expect(screen.getByText('Ficha y Dado')).toBeInTheDocument();
    expect(screen.getByText('📍 Ciudad de México, CDMX')).toBeInTheDocument();

    const editBtn = screen.getByText('Editar perfil');
    fireEvent.click(editBtn);

    expect(screen.getByText(/Editar perfil de tienda: Ficha y Dado/i)).toBeInTheDocument();

    const cityInput = screen.getByDisplayValue('Ciudad de México, CDMX');
    const bioInput = screen.getByDisplayValue('Tienda en CDMX');

    fireEvent.change(cityInput, { target: { value: 'Guadalajara, JAL' } });
    fireEvent.change(bioInput, { target: { value: 'Nueva descripción guardada por admin' } });

    const saveBtn = screen.getByText('Guardar cambios');
    fireEvent.click(saveBtn);

    expect(screen.getByText('📍 Guadalajara, JAL')).toBeInTheDocument();
    expect(screen.queryByText(/Editar perfil de tienda: Ficha y Dado/i)).not.toBeInTheDocument();
  });
});
