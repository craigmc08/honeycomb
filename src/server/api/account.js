export async function signUp(args, context) {
  return context.entities.User.create({
    data: {
      name: args.name,
      username: args.email,
      password: args.password,
    },
    _waspSkipDefaultValidates: true,
    _waspCustomValidations: [
      {
        validates: 'password',
        message: 'Password must be at least 8 characters long',
        validator: password => password.length >= 8
      }
    ]
  })
}
