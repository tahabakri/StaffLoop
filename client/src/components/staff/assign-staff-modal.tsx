import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

const mockStaff = [
  { id: 1, name: "John Doe", role: "Hostess", whatsapp: "+971501234567" },
  { id: 2, name: "Jane Smith", role: "Support", whatsapp: "+971501234568" },
  { id: 3, name: "Bob Lee", role: "Security", whatsapp: "+971501234569" },
];

export function AssignStaffModal({ open, onOpenChange, onStaffAssigned }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffAssigned: (staff: any[]) => void;
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredStaff = mockStaff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.whatsapp.includes(search)
  );

  const handleToggle = (id: number) => {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };

  const handleAssign = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const assigned = mockStaff.filter(s => selected.includes(s.id));
      toast({ title: `Assigned ${assigned.length} staff to event.` });
      onStaffAssigned(assigned);
      onOpenChange(false);
      setSelected([]);
      setSearch("");
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Staff to Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Search staff by name or WhatsApp" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="max-h-60 overflow-y-auto border rounded p-2">
            {filteredStaff.length === 0 && <div className="text-gray-500 text-sm">No staff found.</div>}
            {filteredStaff.map(staff => (
              <div key={staff.id} className="flex items-center gap-2 py-1">
                <Checkbox checked={selected.includes(staff.id)} onCheckedChange={() => handleToggle(staff.id)} />
                <span className="flex-1">{staff.name} <span className="text-xs text-gray-400 ml-2">({staff.role})</span></span>
                <span className="text-xs text-gray-500">{staff.whatsapp}</span>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={handleAssign} disabled={selected.length === 0 || loading}>
            {loading ? <Spinner className="mr-2 h-4 w-4" /> : "Assign Selected"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 