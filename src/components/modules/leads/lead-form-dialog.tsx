"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeadPriority, LeadStatus, OrderStatus } from "@prisma/client";
import { format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { upsertLeadAction } from "@/app/actions/leads";
import { ChatProofUpload } from "@/components/modules/leads/chat-proof-upload";
import { DatePickerField } from "@/components/shared/date-picker-field";
import {
  FormSelectTriggerLabel,
  resolveOptionLabel,
} from "@/components/shared/form-select-trigger-label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOST_REASON_LABELS, LOST_REASON_OPTIONS } from "@/lib/constants/lost-reasons";
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from "@/lib/constants/orders";
import {
  LEAD_PRIORITY_LABELS,
  LEAD_PRIORITY_OPTIONS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_OPTIONS,
} from "@/lib/constants/leads";
import { leadFormSchema, type LeadFormInput } from "@/lib/validations/leads/lead-form-schema";
import type { SessionUser } from "@/types/common/session-user";
import type { LeadFormRecord } from "@/types/leads/lead-detail";
import type { LeadFilterOptions } from "@/types/leads/lead-filter-options";

type LeadFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterOptions: LeadFilterOptions;
  user: SessionUser;
  editing: LeadFormRecord | null;
};

function buildDefaults(user: SessionUser): LeadFormInput {
  return {
    dateReceived: format(new Date(), "yyyy-MM-dd"),
    clientName: "",
    fiverrUsername: "",
    chatLink: "",
    fiverrAccountId: 0,
    salespersonId: user.id,
    serviceId: 0,
    status: LeadStatus.NewMessage,
    priority: LeadPriority.Warm,
    estProjectValue: 0,
    followUpDate: "",
    clientRequirement: "",
    internalNotes: "",
    lostChatProof: null,
    upsellEligible: false,
    orderStatus: OrderStatus.New,
  };
}

export function LeadFormDialog({
  open,
  onOpenChange,
  filterOptions,
  user,
  editing,
}: LeadFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: buildDefaults(user),
  });

  const statusValue = form.watch("status");
  const fiverrAccountId = form.watch("fiverrAccountId");
  const serviceId = form.watch("serviceId");
  const salespersonId = form.watch("salespersonId");
  const priorityValue = form.watch("priority");
  const lostReasonValue = form.watch("lostReason");
  const orderStatusValue = form.watch("orderStatus");
  const isAdmin = user.role === "Admin";

  useEffect(() => {
    if (!open) {
      return;
    }
    if (editing) {
      form.reset({
        id: editing.id,
        dateReceived: editing.dateReceived,
        clientName: editing.clientName ?? "",
        fiverrUsername: editing.fiverrUsername,
        chatLink: editing.chatLink ?? "",
        fiverrAccountId: editing.fiverrAccountId,
        salespersonId: editing.salespersonId,
        serviceId: editing.serviceId,
        status: editing.status,
        priority: editing.priority,
        estProjectValue: editing.estProjectValue,
        followUpDate: editing.followUpDate ?? "",
        clientRequirement: editing.clientRequirement ?? "",
        internalNotes: editing.internalNotes ?? "",
        lostReason: editing.lostReason,
        lostChatProof: editing.lostChatProof,
        orderValue: editing.orderValue,
        orderStatus: editing.orderStatus ?? OrderStatus.New,
        upsellEligible: editing.upsellEligible,
      });
    } else {
      form.reset(buildDefaults(user));
    }
  }, [open, editing, form, user]);

  const onSubmit = (values: LeadFormInput): void => {
    const payload = isAdmin ? values : { ...values, salespersonId: user.id };
    startTransition(async () => {
      const result = await upsertLeadAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Lead updated." : "Lead created.");
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit lead" : "Add lead"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="form-field-label" htmlFor="dateReceived">
                Date received
              </Label>
              <Controller
                control={form.control}
                name="dateReceived"
                render={({ field }) => (
                  <DatePickerField
                    id="dateReceived"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select date received"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="form-field-label">Fiverr account</Label>
              <Select
                value={fiverrAccountId ? String(fiverrAccountId) : ""}
                onValueChange={(value) => {
                  if (!value) return;
                  form.setValue("fiverrAccountId", Number.parseInt(value, 10), { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <FormSelectTriggerLabel
                    value={resolveOptionLabel(
                      filterOptions.fiverrAccounts,
                      fiverrAccountId || undefined,
                      "Select account",
                    )}
                    placeholder="Select account"
                  />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {filterOptions.fiverrAccounts.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="form-field-label" htmlFor="clientName">
                Client name
              </Label>
              <Input id="clientName" placeholder="Client display name" {...form.register("clientName")} />
            </div>
            <div className="space-y-2">
              <Label className="form-field-label" htmlFor="fiverrUsername">
                Fiverr username
              </Label>
              <Input
                id="fiverrUsername"
                placeholder="Fiverr @username"
                {...form.register("fiverrUsername")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="form-field-label" htmlFor="chatLink">
              Chat link
            </Label>
            <Input
              id="chatLink"
              placeholder="Link to the Fiverr chat thread"
              {...form.register("chatLink")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {isAdmin ? (
              <div className="space-y-2">
                <Label className="form-field-label">Salesperson</Label>
                <Select
                  value={String(salespersonId)}
                  onValueChange={(value) => {
                    if (!value) return;
                    form.setValue("salespersonId", Number.parseInt(value, 10), { shouldValidate: true });
                  }}
                >
                  <SelectTrigger>
                    <FormSelectTriggerLabel
                      value={resolveOptionLabel(filterOptions.salespeople, salespersonId, "Select rep")}
                      placeholder="Select rep"
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {filterOptions.salespeople.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <input type="hidden" {...form.register("salespersonId", { valueAsNumber: true })} />
            )}
            <div className="space-y-2">
              <Label className="form-field-label">Service</Label>
              <Select
                value={serviceId ? String(serviceId) : ""}
                onValueChange={(value) => {
                  if (!value) return;
                  form.setValue("serviceId", Number.parseInt(value, 10), { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <FormSelectTriggerLabel
                    value={resolveOptionLabel(filterOptions.services, serviceId || undefined, "Select service")}
                    placeholder="Select service"
                  />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {filterOptions.services.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="form-field-label" htmlFor="estProjectValue">
                Estimated project value (USD)
              </Label>
              <Input
                id="estProjectValue"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                {...form.register("estProjectValue", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label className="form-field-label" htmlFor="followUpDate">
                Follow-up date
              </Label>
              <Controller
                control={form.control}
                name="followUpDate"
                render={({ field }) => (
                  <DatePickerField
                    id="followUpDate"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Optional follow-up"
                    clearable
                  />
                )}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="form-field-label">Lead status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => value && form.setValue("status", value as LeadStatus)}
              >
                <SelectTrigger>
                  <FormSelectTriggerLabel value={LEAD_STATUS_LABELS[statusValue]} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {LEAD_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="form-field-label">Lead priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) => value && form.setValue("priority", value as LeadPriority)}
              >
                <SelectTrigger>
                  <FormSelectTriggerLabel value={LEAD_PRIORITY_LABELS[priorityValue]} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {LEAD_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {statusValue === LeadStatus.Lost && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="form-field-label">Lost reason</Label>
                <Select
                  value={lostReasonValue ?? ""}
                  onValueChange={(value) => {
                    if (!value) return;
                    form.setValue("lostReason", value as LeadFormInput["lostReason"], {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger>
                    <FormSelectTriggerLabel
                      value={
                        lostReasonValue ? LOST_REASON_LABELS[lostReasonValue] : "Select reason"
                      }
                      placeholder="Select reason"
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {LOST_REASON_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.lostReason?.message && (
                  <p className="text-xs text-destructive">{form.formState.errors.lostReason.message}</p>
                )}
              </div>
              <Controller
                control={form.control}
                name="lostChatProof"
                render={({ field }) => (
                  <ChatProofUpload
                    value={field.value ?? null}
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
            </div>
          )}

          {statusValue === LeadStatus.OrderReceived && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="form-field-label" htmlFor="orderValue">
                    Order value (USD)
                  </Label>
                  <Input
                    id="orderValue"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    {...form.register("orderValue", { valueAsNumber: true })}
                  />
                  {form.formState.errors.orderValue?.message && (
                    <p className="text-xs text-destructive">{form.formState.errors.orderValue.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="form-field-label">Order status</Label>
                  <Select
                    value={orderStatusValue ?? OrderStatus.New}
                    onValueChange={(value) => value && form.setValue("orderStatus", value as OrderStatus)}
                  >
                    <SelectTrigger>
                      <FormSelectTriggerLabel
                        value={ORDER_STATUS_LABELS[orderStatusValue ?? OrderStatus.New]}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {ORDER_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.orderStatus?.message && (
                    <p className="text-xs text-destructive">{form.formState.errors.orderStatus.message}</p>
                  )}
                </div>
              </div>
              <label className="glass-field flex cursor-pointer items-start gap-3 rounded-xl p-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4 rounded border-input accent-[#C3F53C]"
                  {...form.register("upsellEligible")}
                />
                <span className="space-y-1">
                  <span className="block text-sm font-medium">Upsell eligible</span>
                  <span className="block text-xs text-muted-foreground">
                    Saving will also create a linked order automatically.
                  </span>
                </span>
              </label>
            </>
          )}

          <div className="space-y-2">
            <Label className="form-field-label" htmlFor="clientRequirement">
              Client requirement
            </Label>
            <Textarea
              id="clientRequirement"
              placeholder="What the client asked for…"
              {...form.register("clientRequirement")}
            />
          </div>
          <div className="space-y-2">
            <Label className="form-field-label" htmlFor="internalNotes">
              Internal notes
            </Label>
            <Textarea
              id="internalNotes"
              placeholder="Internal notes for your team…"
              {...form.register("internalNotes")}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
