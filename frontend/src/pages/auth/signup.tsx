import { SignupForm } from "@/components/forms/signup-form";

const Signup = () => {
  return (
    <main id="signup" className="flex justify-center items-center">
      <div className="max-w-sm w-full">
        <SignupForm />
      </div>
    </main>
  );
};

export default Signup;
