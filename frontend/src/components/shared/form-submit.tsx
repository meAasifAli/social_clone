import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function FormSubmit({
  label,
  loading,
}: {
  label: string;
  loading: boolean;
}) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className="flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
