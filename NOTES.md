Good things:

1.  Extremely easy to get a project set up.

2.  I don't have to worry about the server-side, or databases, or server-client
    communication. It's very freeing to have all the boring stuff out of the way
    so I can focus on the important parts.

Pain points:

0.  DB transactions. We can't access prisma's built-in transaction system, as far
    as I am aware.

1.  usernameAndPassword auth methods requires certain names in DB, but I want to
    use different column names (I want email instead of username). Makes my DB
    schema a little bit more confusing.

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

5.  There isn't a path for including static assets. For example, if I want to
    use an image, I have to import it into my JS and use it in-line, which is
    annoying for a couple reasons: (1) makes it awkward to use images in CSS
    properties (ex. for backgrounds) (2) I'm guessing the images end up encoded
    as data URIs? Which seems bad for code size.

6.  Debugging sometimes ends up with me looking through generated code. This is
    workable, but it'd be cool to be able to avoid this!

Things I would like to see but it isn't that bad to not have them:

1.  IDE support for prisma declarations in a wasp file would be nice.

2.  Type hints for prisma queries in my action/operation functions would be very
    helpful.

3.  Having `wasp add` or `wasp install` or something that adds to the dependencies
    list in the project `.wasp` file in the current directory would be helpful,
    that way I don't have to manually find the latest version number for a package
