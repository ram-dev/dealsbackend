var nodemailer = require('nodemailer');
var smtpConfig = require(__base).Config.smtp;
/**
 * Relays a mail to smtp server configured in local config file from 
 * sender ramkumar.consult@gmail.com to receiver.
 * @param  {String} receiver - the email receiver
 * @param  {String} subject - header of the email.
 * @param  {String} body - the contex of the email.
 * @param  {function(err, info)} done - callback on finished  
 */
module.exports.sendMailTo = function (sender, subject, body, done) {
    var transporter = nodemailer.createTransport(smtpConfig);
    var mailOptions = {
        // from: sender, // sender address 
        // Sender must always be no-reply@ for SMTP to work. 
        from: 'ramkumar.consult@gmail.com',
        replyTo: sender,
        to: 'ramkumar.consult@gmail.com', // list of receivers
        subject: subject, // Subject line
        html: body // html body
    };

    transporter.sendMail(mailOptions, done);
};