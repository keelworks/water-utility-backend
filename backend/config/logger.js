const pino = require('pino'); // use logrotate for linux servers.

// const transport = pino.transport({
//     targets: [
//       {
//         target: 'pino/file',
//         options: { destination: `${__dirname}/app.log` },
//       },
//       {
//         target: 'pino-pretty', // install pino-pretty
//       },
//     ],
//   });

module.exports = pino({
    level: process.env.PINO_LOG_LEVEL || 'info',
    formatters: {
        level: (label) => {
          return { level: label.toUpperCase() };
        },
      },
      timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    //   redact: {
    //     paths: ['user.name', 'user.address', 'user.passport', 'user.phone'],
    //     censor: '[xxxxxxxxxx]',
    //   } // user is any object schema being logged

});
