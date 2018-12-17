module.exports = app => {
	app.post('/api/email/send', (req, res) => {
		if (!process.env.GMAIL_USER) {
			return res.json({
				result: false
			});
		}
		if (!process.env.GMAIL_PASS) {
			return res.json({
				result: false
			});
		}
		var send = require('gmail-send')({
			//var send = require('../index.js')({
			user: process.env.GMAIL_USER,
			// user: credentials.user,                  // Your GMail account used to send emails
			pass: process.env.GMAIL_PASS,
			// pass: credentials.pass,                  // Application-specific password
			to: req.body.to || process.env.GMAIL_USER,
			// to:   credentials.user,                  // Send to yourself
			// you also may set array of recipients:
			// [ 'user1@gmail.com', 'user2@gmail.com' ]
			// from:    credentials.user,            // from: by default equals to user
			// replyTo: credentials.user,            // replyTo: by default undefined
			replyTo: 'noreply@eutopiaecoaldea.com',
			// bcc: 'some-user@mail.com',            // almost any option of `nodemailer` will be passed to it
			subject: req.body.subject || '(no subject)',
			//text: 'gmail-send example 1', // Plain text
			//html:    '<b>html text</b>'            // HTML
			html: req.body.html || ''
		});

		send({ // Overriding default parameters
		}, function(err, result) {
			if (err) {
				console.error(req.url, err.stack);
				return res.json({
					result: false
				});
			} else {
				return res.json({
					result: true
				});
			}
		});

	})
}