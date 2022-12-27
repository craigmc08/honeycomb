import * as yup from 'yup';

export const updateUsername = yup.object().shape({
  username: yup.string().required(),
});

export const updateEmail = yup.object().shape({
  email: yup.string().required(),
});
