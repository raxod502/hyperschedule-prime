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

    $ npm install

Start the server:

    $ node server.js

This will download, parse, and cache the Portal courses automatically
every 10 seconds. To handle this manually, do instead:

    $ node parser.js
    $ node server.js --manual

In either case, navigate to `localhost:5000` in your web browser.

## Deployment

Test the app locally:

    $ heroku local

It will be deployed to `localhost:5000`.

When you push to master, the app is deployed automatically
to [Hyperschedule][hyperschedule].

## Coding style

Lots of comments. All variables and functions should have
[docstrings][jsdoc].

## More information

See:

* [UI information](doc/ui.md)
* [Future plans](doc/roadmap.md)

[jsdoc]: http://usejsdoc.org/
[hyperschedule]: https://hyperschedule.herokuapp.com/
