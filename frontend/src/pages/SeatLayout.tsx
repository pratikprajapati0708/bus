import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
interface Seat {
    id: number;
    label: string;
    x: number;
    y: number;
    status: string;
}
const isTokenExpired = (): boolean => {
    const expirationTime = localStorage.getItem('token_expiration');
    if (!expirationTime) return true;
    return Date.now() > parseInt(expirationTime, 10);
};

const SeatLayout: React.FC = () => {
    const [seats, setSeats] = useState<Seat[][]>([]);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const navigate = useNavigate();
    useEffect(() => {
        if (isTokenExpired()) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('token_expiration');
            navigate('/login');
            return;
        }

        const fetchSeats = async () => {
            if (selectedDate) {
                try {
                    const response = await axios.get(`http://localhost:3000/api/seats?date=${selectedDate}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log(response);

                    const seats: Seat[] = response.data;

                    // Group seats by rows for layout
                    const seatsByRows: Seat[][] = [];
                    seats.forEach((seat) => {
                        if (!seatsByRows[seat.x]) {
                            seatsByRows[seat.x] = [];
                        }
                        seatsByRows[seat.x][seat.y] = seat;
                    });

                    setSeats(seatsByRows);
                } catch (error) {
                    console.error('Error fetching seats', error);
                }
            } else {
                const mockSeats: Seat[][] = [];
                for (let i = 0; i < 6; i++) {
                    const row: Seat[] = [];
                    for (let j = 0; j < 8; j++) {
                        row.push({
                            id: i * 8 + j + 1,
                            label: `${i * 8 + j + 1}`,
                            x: i,
                            y: j,
                            status: 'available',
                        });
                    }
                    mockSeats.push(row);
                }
                setSeats(mockSeats);
                setSelectedSeat(null);
            }
        };

        fetchSeats();
    }, [selectedDate, token]);

    const handleSeatClick = (rowIndex: number, seatIndex: number) => {
        if (!selectedDate || seats[rowIndex][seatIndex].status !== 'available') return;

        setSeats(prevSeats => {
            return prevSeats.map((row, rIndex) =>
                row.map((seat, sIndex) => {
                    if (rIndex === rowIndex && sIndex === seatIndex) {
                        setSelectedSeat(seat);
                        return { ...seat, status: 'selected' };
                    } else if (seat.status === 'selected') {
                        return { ...seat, status: 'available' };
                    }
                    return seat;
                })
            );
        });
    };

    const reserveSeat = async () => {
        if (!selectedSeat) {
            alert('Please select a seat to reserve.');
            return;
        }
        const seatId = selectedSeat.id;
        try {
            await axios.post(
                'http://localhost:3000/api/reserve',
                { seatId, date: selectedDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Seat reserved successfully');
            alert("Seat reserved successfully.Kindly refresh the page to validate");
        } catch (error) {
            console.error('Error reserving seat', error);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
        setSelectedSeat(null);
    };
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed in JS
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    return (
        <div className="movie-container flex flex-col items-center justify-center text-white">
            <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={getTodayDate()}
                className="my-4 p-2 border border-gray-300 rounded text-black"
            />
            <div className="container flex flex-col items-center mt-10">
                {seats.map((row, rowIndex) => (
                    <div key={rowIndex} className="row flex justify-center my-1">
                        {row.map((seat, seatIndex) => (
                            <div
                                key={seatIndex}
                                className={`seat h-10 w-10 m-1 rounded-t-md ${seat.status === 'available' ? 'bg-gray-600' : seat.status === 'selected' ? 'bg-blue-600' : 'bg-red-500 cursor-not-allowed'}`}
                                onClick={() => handleSeatClick(rowIndex, seatIndex)}
                                style={{ cursor: selectedDate ? 'pointer' : 'not-allowed' }} // Disabling cursor if no date is selected
                            ></div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex flex-col items-center justify-center">
                <button
                    onClick={reserveSeat}
                    className={`p-2 rounded mt-2 ${selectedDate ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                    disabled={!selectedDate}>
                    Reserve
                </button>
                {selectedSeat && <p className="mt-2 text-violet-600">Selected Seat: {selectedSeat.label}</p>}
            </div>
            <div className='mt-4'>
                <ul className="showcase flex justify-between bg-gray-800 p-2 rounded text-gray-400">
                    <li className="flex items-center mx-2">
                        <div className="seat bg-gray-600 h-3 w-4 rounded-t-md"></div>
                        <small className="ml-1">Available</small>
                    </li>
                    <li className="flex items-center mx-2">
                        <div className="seat bg-blue-600 h-3 w-4 rounded-t-md"></div>
                        <small className="ml-1">Selected</small>
                    </li>
                    <li className="flex items-center mx-2">
                        <div className="seat bg-red-500 h-3 w-4 rounded-t-md"></div>
                        <small className="ml-1">Occupied</small>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SeatLayout;
