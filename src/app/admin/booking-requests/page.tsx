import { BookingRequests } from '@/components/admin/booking-requests';

export default function BookingRequestsPage() {
  return (
    <div className="flex flex-col gap-4 h-full">
        <h1 className="text-3xl font-bold tracking-tight text-primary">All Booking Requests</h1>
        <p className="text-muted-foreground">Manage all incoming tour booking requests from this panel.</p>
        <div className="flex-1 rounded-lg">
            <BookingRequests />
        </div>
    </div>
  );
}
