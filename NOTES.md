Pain points:

1.  usernameAndPassword auth methods requires certain names in DB, but I want to
    use different column names (I want email instead of username). This is a
    little annoying.

2.  If there's an invalid auth token in a request from the front-end, every op
    or action responds with 401, even ones that don't need auth. If I want to
    implement e.g. a custom sign-up or log-in action, this causes issues if there's
    an invalid session in the browser.

3.  Needed to implement a custom sign-up action if I want to change password
    validation rules.

4.  If I want to write a custom login/signup page (which I do), I have to re-implement
    login() after signup(), as well as a redirect. Can't this be abstracted into
    lib code? The redirect is especially annoying since it makes the app.auth.onAuthSucceededRedirectTo
    useless.
