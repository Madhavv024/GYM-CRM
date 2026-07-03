import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreatePlanInput,
  usePlansStore,
} from "@/features/plans/plans.store";
import { cn } from "@/lib/utils";
import type { MembershipPlan } from "@/types";

interface PlanFormValues {
  name: string;
  durationInDays: string;
  price: string;
  joiningFee: string;
  description: string;
  isActive: boolean;
}

interface PlanFormDialogProps {
  plan?: MembershipPlan;
  triggerClassName?: string;
}

const initialFormValues: PlanFormValues = {
  name: "",
  durationInDays: "30",
  price: "",
  joiningFee: "0",
  description: "",
  isActive: true,
};

function getFormValues(plan?: MembershipPlan): PlanFormValues {
  if (!plan) {
    return initialFormValues;
  }

  return {
    name: plan.name,
    durationInDays: String(plan.durationInDays),
    price: String(plan.price),
    joiningFee: String(plan.joiningFee),
    description: plan.description,
    isActive: plan.isActive,
  };
}

function parsePlanInput(values: PlanFormValues): CreatePlanInput | null {
  const name = values.name.trim();
  const description = values.description.trim();
  const durationInDays = Number(values.durationInDays);
  const price = Number(values.price);
  const joiningFee = Number(values.joiningFee);

  if (!name) {
    toast.error("Plan name is required.");
    return null;
  }

  if (!Number.isInteger(durationInDays) || durationInDays <= 0) {
    toast.error("Duration must be a whole number greater than zero.");
    return null;
  }

  if (!Number.isFinite(price) || price < 0) {
    toast.error("Plan price must be zero or greater.");
    return null;
  }

  if (!Number.isFinite(joiningFee) || joiningFee < 0) {
    toast.error("Joining fee must be zero or greater.");
    return null;
  }

  return {
    name,
    durationInDays,
    price,
    joiningFee,
    description,
    isActive: values.isActive,
  };
}

export function PlanFormDialog({
  plan,
  triggerClassName,
}: PlanFormDialogProps) {
  const addPlan = usePlansStore((state) => state.addPlan);
  const updatePlan = usePlansStore((state) => state.updatePlan);

  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<PlanFormValues>(() =>
    getFormValues(plan),
  );

  const isEditing = Boolean(plan);

  useEffect(() => {
    if (isOpen) {
      setValues(getFormValues(plan));
    }
  }, [isOpen, plan]);

  function updateValue<Key extends keyof PlanFormValues>(
    key: Key,
    value: PlanFormValues[Key],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const planInput = parsePlanInput(values);

    if (!planInput) {
      return;
    }

    if (plan) {
      updatePlan(plan.id, planInput);
      toast.success("Membership plan updated.");
    } else {
      addPlan(planInput);
      toast.success("Membership plan created.");
    }

    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "gap-2 bg-primary text-primary-foreground hover:bg-primary/90",
            triggerClassName,
          )}
          type="button"
        >
          {isEditing ? <Pencil className="size-4" /> : <Plus className="size-4" />}
          {isEditing ? "Edit Plan" : "Add Plan"}
        </Button>
      </DialogTrigger>

      <DialogContent className="border-border bg-card text-card-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Membership Plan" : "Create Membership Plan"}
          </DialogTitle>
          <DialogDescription>
            Set the duration, pricing, and availability for this membership plan.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="plan-name">Plan name</Label>
            <Input
              id="plan-name"
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="Example: Monthly Strength"
              value={values.name}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-duration">Duration in days</Label>
              <Input
                id="plan-duration"
                min="1"
                onChange={(event) =>
                  updateValue("durationInDays", event.target.value)
                }
                type="number"
                value={values.durationInDays}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-price">Plan price (₹)</Label>
              <Input
                id="plan-price"
                min="0"
                onChange={(event) => updateValue("price", event.target.value)}
                placeholder="1200"
                type="number"
                value={values.price}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-joining-fee">Joining fee (₹)</Label>
            <Input
              id="plan-joining-fee"
              min="0"
              onChange={(event) =>
                updateValue("joiningFee", event.target.value)
              }
              placeholder="0"
              type="number"
              value={values.joiningFee}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-description">Description</Label>
            <Textarea
              id="plan-description"
              onChange={(event) =>
                updateValue("description", event.target.value)
              }
              placeholder="Describe what this plan includes."
              rows={4}
              value={values.description}
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-3">
            <span>
              <span className="block text-sm font-medium">Plan availability</span>
              <span className="block text-xs text-muted-foreground">
                Inactive plans cannot be selected for new memberships.
              </span>
            </span>

            <input
              checked={values.isActive}
              className="size-4 accent-primary"
              onChange={(event) =>
                updateValue("isActive", event.target.checked)
              }
              type="checkbox"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Create Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}