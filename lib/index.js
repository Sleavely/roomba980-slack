
const ROOMBA_BLID = process.env.ROOMBA_BLID;
const ROOMBA_PASS = process.env.ROOMBA_PASS;
const ROOMBA_IP = process.env.ROOMBA_IP;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;

const dorita = require('dorita980');
const SlackWebhook = require('slack-webhook');
let slack;

console.log('Connecting locally to Roomba via firmware v1..');
// This doesnt actually connect, only prep an API client.
let localConn = dorita.Local(ROOMBA_BLID, ROOMBA_PASS, ROOMBA_IP, 1);

let name = 'Roomba';
let lastStatus = null;
let errorRuns = 0;

// This is the main function where we look for changes in status.
let pollStatus = function(){
  setTimeout(() => {
    localConn.getMission().then((currentStatus) => {
      console.log('Current poll status')
      console.log(currentStatus);

      /**
       * Typical "running" status
       * { ok:
          {
            flags: 4,
            cycle: 'quick',
            phase: 'run',
            pos: { theta: -62, point: [Object] },
            batPct: 76,
            expireM: 0,
            rechrgM: 0,
            error: 0,
            notReady: 0,
            mssnM: 41,
            sqft: 227,
            missionFlags: { idle: false, binFull: false, binRemoved: false, beeping: false },
            notReadyMsg: 'Ready'
          },
          id: 4
        }
       */

      let phasesAsPhrases = {
        'run': 'is now cleaning.',
        'pause': 'paused.',
        'stop': 'stopped!',
        'hmUsrDock': 'is docking at home base.',
        'hmPostMsn': 'is done with cleaning.',
        'charge': 'is now charging.'
      };
      if(lastStatus.ok.phase != currentStatus.ok.phase)
      {
        console.log('New phase detected.', currentStatus.ok.phase);
        slack.send(`_${name} ${phasesAsPhrases[currentStatus.ok.phase]}_`);
      }
      else {
        if(lastStatus.ok.missionFlags.binFull != currentStatus.ok.missionFlags.binFull && currentStatus.ok.missionFlags.binFull)
        {
          console.log('Bin full.');
          slack.send('Hey, my bin is full!');
        }
        else
        {
          if(lastStatus.ok.notReadyMsg != currentStatus.ok.notReadyMsg)
          {
            console.log('New ready-message detected.', currentStatus.ok.notReadyMsg);
            slack.send(currentStatus.ok.notReadyMsg+'!');
          }
        }
      }

      lastStatus = currentStatus;
      errorRuns = 0;
      pollStatus();
    })
    .catch((err) => {
      console.error(`${name} is sad..`, err);
      errorRuns++;
      if(errorRuns > 30) {
        console.log('Fuck it. Sadness is eternal. Giving up.');
        process.exit(1);
      }
      pollStatus();
    })
  }, 2000);
};

// Alright, lets boot up and start polling.
localConn.getPreferences()
  .then(prefs => {
    name = prefs.ok.name;
    console.log(`${name} is alive!`);

    slack = new SlackWebhook(process.env.SLACK_WEBHOOK, {defaults: {username: name, channel: '#vroomba'}});
    return localConn.getMission();
  })
  .then((initialStatus) => {
    // Let's save this status so that we can react to delta changes.
    lastStatus = initialStatus;
    pollStatus();
  })
  .catch((err) => {
    console.error('Roomba is borken!', err);
    process.exit(1);
  });

module.exports = {
  dorita: dorita,
  localConn: localConn,
  slack: slack
};
