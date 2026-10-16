export type SignInFormValues = {
  email: string;
  password: string;
};

export type CreateAccountFormValues = SignInFormValues & {
  confirmPassword: string;
};
