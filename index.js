const exec = require('child_process').exec,
	fs = require('fs'),
	os = require('os'),
	stream = require('stream'),
	Readable = stream.Readable,
	path = require('path'),
	glob = require('glob'),

	config = require('./config'),

	PATH_SRC = path.resolve(__dirname, 'src'),
	PATH_REPORTS = path.resolve(__dirname, 'reports');

function execCommand(str) {
	return new Promise((resolve, reject) => {
		exec(str, (err, stdout) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(stdout);
			}
		});
	});
}

function createStringStream() {
	const s = new Readable();
	//prevent error
	s._read = function noop() {
	};

	s.end = function () {
		this.push(null);
	};

	s.writeln = function (str) {
		this.push(str + '\n');
	};

	return s;
}

function print(str) {
	if (str instanceof Buffer) {
		str = str.toString();
	}
	console.log(str);
}

function hey(opts) {
	opts = {
		m: 'GET',
		t: 50000,
		...opts
	}
}

function test(filename) {
	return new Promise((resolve, reject) => {
		const mod = require(filename),
			app = mod.app,
			stringStream = createStringStream(),
			basename = path.basename(filename, '.js'),
			reportStream = fs.createWriteStream(path.resolve(PATH_REPORTS, basename + '.txt'));

		const server = app.listen(config.LISTEN_PORT, function (err) {
			print(`${basename} ready`);

			stringStream
				.on('data', function (data) {
					if (data instanceof Buffer) {
						data = data.toString();
					}
					print(data);
				})
				.pipe(reportStream)
				.on('finish', function () {
					server.close();
					print(`${basename} closed`);
					resolve();
				});

			(async function () {
				try {
					stringStream.writeln('cpu info: ' + os.cpus()[0].model);
					stringStream.writeln('node version: ' + await execCommand(`node -v`));
					stringStream.writeln(await execCommand(`hey -n 10000 http://localhost:${config.LISTEN_PORT}`));
				}
				catch (e) {
					print(e);
				}
				finally {
					stringStream.end();
				}
			})();
		});
	});
}

glob(`${PATH_SRC}/!(config.js)`, (err, filenames) => {
	(async function () {
		for (let filename of filenames) {
			await test(filename);
			// break;
		}
	})();
});


