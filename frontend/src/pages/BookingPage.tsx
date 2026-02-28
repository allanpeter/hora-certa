import { useState } from 'react';
import { Card, Button, Alert } from '../components/FormElements';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  price: number;
}

interface Barber {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

const mockBarbers: Barber[] = [
  {
    id: '1',
    name: 'João Silva',
    avatar: '👨‍🦲',
    rating: 4.8,
    reviews: 42,
  },
  {
    id: '2',
    name: 'Pedro Costa',
    avatar: '👨‍🦱',
    rating: 4.9,
    reviews: 38,
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    avatar: '👨‍🦳',
    rating: 4.7,
    reviews: 25,
  },
];

const mockServices: Service[] = [
  { id: '1', name: 'Corte Masculino', price: 50, duration: 30, category: 'HAIR' },
  { id: '2', name: 'Barba Completa', price: 40, duration: 30, category: 'BEARD' },
  { id: '3', name: 'Corte + Barba', price: 80, duration: 50, category: 'COMBO' },
  { id: '4', name: 'Tratamento Capilar', price: 60, duration: 45, category: 'PRODUCT' },
];

const mockTimeSlots: TimeSlot[] = [
  { id: '1', time: '09:00', available: true, price: 50 },
  { id: '2', time: '09:30', available: true, price: 50 },
  { id: '3', time: '10:00', available: false, price: 50 },
  { id: '4', time: '10:30', available: true, price: 50 },
  { id: '5', time: '11:00', available: true, price: 50 },
  { id: '6', time: '14:00', available: true, price: 50 },
  { id: '7', time: '14:30', available: true, price: 50 },
  { id: '8', time: '15:00', available: false, price: 50 },
  { id: '9', time: '15:30', available: true, price: 50 },
  { id: '10', time: '16:00', available: true, price: 50 },
];

export const BookingPage = () => {
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const barber = mockBarbers.find((b) => b.id === selectedBarber);
  const service = mockServices.find((s) => s.id === selectedService);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleBooking = () => {
    setBookingConfirmed(true);
    setTimeout(() => {
      // Reset form
      setSelectedBarber('');
      setSelectedService('');
      setSelectedDate('');
      setSelectedTime('');
      setBookingStep(1);
      setBookingConfirmed(false);
    }, 2000);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Agendamento Confirmado!</h2>
          <p className="text-gray-600 mb-6">
            Seu agendamento com {barber?.name} foi confirmado com sucesso.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left mb-6">
            <p className="text-sm text-gray-600">
              <strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Horário:</strong> {selectedTime}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Serviço:</strong> {service?.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Preço:</strong> R$ {service?.price}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Você receberá um email e SMS com os detalhes do agendamento.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Agende seu Atendimento</h1>
      <p className="text-gray-600 mb-8">Escolha seu barbeiro, serviço e horário preferido</p>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex items-center ${step < 3 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                bookingStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 transition ${
                  bookingStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {bookingStep === 1 && (
            <Card>
              <h2 className="text-xl font-bold mb-6">Escolha um Barbeiro</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockBarbers.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBarber(b.id);
                      setBookingStep(2);
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedBarber === b.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-4xl mb-3 text-center">{b.avatar}</div>
                    <h3 className="font-bold text-center mb-2">{b.name}</h3>
                    <div className="text-center">
                      <p className="text-yellow-500 text-sm">⭐ {b.rating}</p>
                      <p className="text-gray-600 text-xs">({b.reviews} avaliações)</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {bookingStep === 2 && (
            <Card>
              <h2 className="text-xl font-bold mb-6">Escolha o Serviço</h2>
              <div className="space-y-3">
                {mockServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedService(s.id);
                      setBookingStep(3);
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition flex justify-between items-center ${
                      selectedService === s.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold">{s.name}</h3>
                      <p className="text-sm text-gray-600">{s.duration} minutos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">R$ {s.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {bookingStep === 3 && (
            <div className="space-y-6">
              {/* Date Picker */}
              <Card>
                <h2 className="text-lg font-bold mb-4">Escolha a Data</h2>
                <input
                  type="date"
                  min={getTomorrowDate()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Card>

              {/* Time Slots */}
              {selectedDate && (
                <Card>
                  <h2 className="text-lg font-bold mb-4">Escolha o Horário</h2>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {mockTimeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-2 rounded-lg transition font-medium text-sm ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedTime === slot.time
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <h3 className="text-lg font-bold mb-4">Resumo</h3>

            {barber && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Barbeiro</p>
                <p className="font-semibold">{barber.name}</p>
                <p className="text-yellow-500 text-sm">⭐ {barber.rating}</p>
              </div>
            )}

            {service && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Serviço</p>
                <p className="font-semibold">{service.name}</p>
                <p className="text-gray-600 text-sm">{service.duration} minutos</p>
              </div>
            )}

            {selectedDate && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Data e Hora</p>
                <p className="font-semibold">
                  {new Date(selectedDate).toLocaleDateString('pt-BR')}
                </p>
                {selectedTime && <p className="text-gray-600 text-sm">{selectedTime}</p>}
              </div>
            )}

            {service && (
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <span>Preço:</span>
                  <span className="font-bold text-lg text-blue-600">R$ {service.price}</span>
                </div>
              </div>
            )}

            {bookingStep === 1 && (
              <Alert variant="info">
                Comece selecionando seu barbeiro preferido
              </Alert>
            )}

            {bookingStep === 2 && (
              <Alert variant="info">
                Agora escolha o serviço desejado
              </Alert>
            )}

            {bookingStep === 3 && (
              <>
                {selectedDate && selectedTime && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleBooking}
                  >
                    ✓ Confirmar Agendamento
                  </Button>
                )}
                {(!selectedDate || !selectedTime) && (
                  <p className="text-sm text-gray-500 text-center">
                    Selecione a data e horário
                  </p>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
