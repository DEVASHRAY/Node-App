import validator from 'validator';

export const validateSignUpData = ({
  emailId,
  firstName,
  lastName,
  password,
}: {
  firstName: string;
  lastName: string;
  emailId: string;
  password: string;
}) => {
  if (!firstName || !lastName) {
    throw new Error('Name is not valid');
  } else if (!validator.isEmail(emailId)) {
    throw new Error('Email is not valid');
  } else if (!validator.isStrongPassword(password)) {
    throw new Error('use strong password');
  }
};
