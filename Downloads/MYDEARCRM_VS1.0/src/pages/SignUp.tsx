
import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp: React.FC = () => {
  return (
    <AuthLayout title="Cadastre-se no MyDear CRM">
      <SignUpForm />
    </AuthLayout>
  );
};

export default SignUp;
