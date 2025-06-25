import { BookingRequests } from '@/components/admin/booking-requests';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-primary mb-6">Booking Requests</h1>
      <BookingRequests />
    </div>
  );
}
