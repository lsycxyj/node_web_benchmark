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

if (!fs.existsSync(PATH_REPORTS)) {
	fs.mkdirSync(PATH_REPORTS);
}

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

function heyCommand(opts) {
	opts = Object.assign({}, {
		m: 'GET',
		n: 30000,
	}, opts);

	const args = [];

	for (let k of Object.keys(opts)) {
		args.push(`-${k}`, opts[k])
	}

	return `hey ${args.join(' ')} http://localhost:${config.LISTEN_PORT}`;
}

function test(filename) {
	return new Promise(async (resolve, reject) => {
		const mod = require(filename),
			basename = path.basename(filename, '.js'),
			stringStream = createStringStream(),
			reportStream = fs.createWriteStream(path.resolve(PATH_REPORTS, basename + '.txt'));

		stringStream
			.on('data', function (data) {
				if (data instanceof Buffer) {
					data = data.toString();
				}
				print(data);
			});
		stringStream.writeln('cpu info: ' + os.cpus()[0].model);
		stringStream.writeln('node version: ' + process.version);

		stringStream
			.pipe(reportStream)
			.on('finish', function () {
				resolve();
			});

		let server = null;

		try {
			for (let amount of [0]) {
				stringStream.writeln(`---------${amount} middlewares---------`);

				const app = mod.createApp({
						middlewareAmount: amount
					});
				server = await new Promise((resolve, reject) => {
					const s = app.listen(config.LISTEN_PORT, function (err) {
						if (!err) {
							print(`${basename} ready`);
							resolve(s);
						}
						else {
							reject(err);
						}
					});
				});

				for (let m of ['GET', 'POST']) {
					stringStream.writeln(`Method -- ${m}: `);
					stringStream.writeln(await execCommand(heyCommand({
						m
					})));
				}

				server.close();
				server = null;

				print(`${basename} closed`);
			}
		}
		catch (e) {
			print(e);
		}
		finally {
			if(server) {
				server.close();
			}
			stringStream.end();
		}
	});
}

glob(`${PATH_SRC}/!(config.js)`, async (err, filenames) => {
	for (let filename of filenames) {
		await test(filename);
	}
});


