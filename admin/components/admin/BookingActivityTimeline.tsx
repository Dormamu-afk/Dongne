const STATUS_LABELS: Record<string, string> = {
  inquiry: 'Inquiry', curating: 'Curating', proposed: 'Proposed',
  host_pending: 'Host Pending', host_confirmed: 'Host OK',
  payment_pending: 'Payment Pending', paid: 'Paid', booked: 'Booked',
  checked_in: 'Checked In', completed: 'Completed',
  cancelled: 'Cancelled', rejected: 'Rejected',
};

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function BookingActivityTimeline({ activities, booking }: { activities: any[]; booking: any }) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {/* Created entry */}
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-2 h-2 rounded-full bg-[#8B7355] mt-1" />
        </div>
        <div>
          <p className="text-xs font-medium text-[#2C2420]">Request created</p>
          <p className="text-[10px] text-[#A89880]">{fmtDateTime(booking.inquiry_at || booking.created_at)}</p>
        </div>
      </div>

      {[...activities].reverse().map(a => (
        <div key={a.id} className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-[#C4714A] mt-1" />
          </div>
          <div>
            {a.activity_type === 'status_change' ? (
              <p className="text-xs font-medium text-[#2C2420]">
                {STATUS_LABELS[a.from_status] ?? a.from_status} → {STATUS_LABELS[a.to_status] ?? a.to_status}
              </p>
            ) : (
              <p className="text-xs font-medium text-[#2C2420] capitalize">{a.activity_type.replace(/_/g, ' ')}</p>
            )}
            {a.message && <p className="text-xs text-[#8B7355] mt-0.5">{a.message}</p>}
            <p className="text-[10px] text-[#A89880]">{fmtDateTime(a.created_at)}</p>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <p className="text-xs text-[#A89880] text-center py-4">No activity yet</p>
      )}
    </div>
  );
}
