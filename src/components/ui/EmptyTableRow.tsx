import { Inbox } from "lucide-react";

interface EmptyTableRowProps {
  colSpan: number;
  message?: string;
}

export function EmptyTableRow({
  colSpan,
  message = "Belum ada data yang sesuai.",
}: EmptyTableRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-gray-500 text-sm">
        <div className="flex flex-col items-center justify-center gap-2">
          <Inbox className="w-6 h-6 text-gray-400" />
          <span>{message}</span>
        </div>
      </td>
    </tr>
  );
}
