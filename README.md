**Hyperschedule**: responsive scheduler for HMC classes. Check out the
webapp [here][hyperschedule]!

## Dependencies

* [Git](https://git-scm.com/) (to obtain and contribute to the code)
* [node.js](https://nodejs.org/en/) (to run the backend)
* [Heroku](https://heroku.com/) (to test the deployment pipeline)

## Development

Clone the repo:

    $ git clone https://github.com/raxod502/hyperschedule.git
    $ cd hyperschedule

Install the dependencies:

    $ cd backend
    $ npm install

Start the server:

    $ npm run server

This will download, parse, and cache the Portal courses automatically
every 10 seconds. To handle this manually, do instead:

    $ npm run parser
    $ npm run server -- --manual

In either case, navigate to `localhost:5000` in your web browser.

## Deployment

Test the app locally:

    $ heroku local

It will be deployed to `localhost:5000`.

When you push to master, the app is deployed automatically
to [Hyperschedule][hyperschedule]. Alternatively, you can deploy
manually by adding the Heroku Git remote and then pushing to it:

    $ heroku login
    $ heroku git:remote -a hyperschedule
    $ git push heroku master

To roll back an accidental deploy, use:

    $ heroku rollback

## Coding style

Lots of comments. All variables and functions should have
[docstrings][jsdoc].

## More information

See:

* [UI information](doc/ui.md)
* [Future plans](doc/roadmap.md)

[jsdoc]: http://usejsdoc.org/
[hyperschedule]: https://hyperschedule.herokuapp.com/
