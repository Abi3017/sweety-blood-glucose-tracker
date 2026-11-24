import { TIME_SLOTS, TIME_SLOT_LABELS } from '../../utils/timeSlots';
import { formatDate } from '../../utils/dates';

/** Table view of a report: one row per date that has readings, one column per slot. */
export default function ReadingsBySlotTable({ readings }) {
  const rows = [];
  readings.forEach((r) => {
    let row = rows[rows.length - 1];
    if (!row || row.date !== r.readingDate) {
      row = { date: r.readingDate };
      rows.push(row);
    }
    row[r.timeSlot] = r.glucoseValue;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Readings by date and time slot (mg/dL)</caption>
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">Date</th>
            {TIME_SLOTS.map((slot) => (
              <th key={slot} scope="col" className="whitespace-nowrap px-5 py-3 text-right font-medium">
                {TIME_SLOT_LABELS[slot]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.date}>
              <th scope="row" className="whitespace-nowrap px-5 py-3 font-medium text-slate-900">
                {formatDate(row.date)}
              </th>
              {TIME_SLOTS.map((slot) => (
                <td key={slot} className="px-5 py-3 text-right tabular-nums text-slate-700">
                  {row[slot] ?? <span className="text-slate-300" aria-label="No reading">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
