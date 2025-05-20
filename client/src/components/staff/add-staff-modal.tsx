import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

const staffSchema = z.object({
  name: z.string().min(2, "Full Name is required"),
  whatsapp: z.string().min(6, "WhatsApp Number is required"),
  email: z.string().email().optional().or(z.literal("")),
  role: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

export function AddStaffModal({ open, onOpenChange, onStaffAdded }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffAdded: (staff: StaffFormValues) => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", whatsapp: "", email: "", role: "" },
  });

  const handleSubmit = async (values: StaffFormValues) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({ title: `Staff ${values.name} added successfully.` });
      onStaffAdded(values);
      onOpenChange(false);
      form.reset();
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Staff</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <div>
            <Label>Full Name *</Label>
            <Input {...form.register("name")}/>
            {form.formState.errors.name && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label>WhatsApp Number *</Label>
            <Input {...form.register("whatsapp")}/>
            {form.formState.errors.whatsapp && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.whatsapp.message}</p>
            )}
          </div>
          <div>
            <Label>Email</Label>
            <Input {...form.register("email")}/>
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label>Role</Label>
            <Select onValueChange={val => form.setValue("role", val)} value={form.watch("role") || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select role (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hostess">Hostess</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner className="mr-2 h-4 w-4" /> : "Add Staff"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 