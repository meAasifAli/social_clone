import { LoginForm } from "@/components/forms/login-form";

const Login = () => {
  return (
    <main id="login" className="flex justify-center items-center">
      <div className="max-w-sm w-full">
        <LoginForm />
      </div>
    </main>
  );
};

export default Login;
