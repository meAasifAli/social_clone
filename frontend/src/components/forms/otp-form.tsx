import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

import { otpSchema, type OTPSchema } from "@/schemas/otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { FormSubmit } from "@/components/shared/form-submit";

import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "@/store/apis/auth-api";

export function OTPForm(props: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate();
  const location = useLocation();

  // email passed from signup page
  const email = (location.state as { email?: string })?.email;

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const form = useForm<OTPSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (values: OTPSchema) => {
    if (!email) {
      toast.error("Missing email. Please sign up again.");
      navigate("/auth/signup");
      return;
    }

    try {
      await verifyOtp({
        email,
        otp: values.otp,
      }).unwrap();

      toast.success("Account verified successfully");
      navigate("/auth/login", { replace: true });
    } catch (err) {
      if (err instanceof Error) toast.error(err?.message || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Missing email. Please sign up again.");
      navigate("/auth/signup");
      return;
    }

    try {
      await resendOtp({ email }).unwrap();
      toast.success("OTP resent to your email");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <Card {...props}>
      <CardHeader className="text-center">
        <CardTitle>Verify your account</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to your email
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* OTP Field */}
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Verification code</FormLabel>

                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup className="gap-2.5">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="rounded-md border"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <FormSubmit label="Verify Account" loading={isLoading} />

              {/* Resend */}
              <FieldDescription className="text-center">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  className="underline underline-offset-4 disabled:opacity-50"
                  disabled={isResending}
                  onClick={handleResend}
                >
                  Resend
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
