
# roomba980-slack

Notifies you in your favorite Slack channel when the Roomba changes state.

_Currently only supports firmware v1. For v2, have a look at [miquelbeltran/roomba-slack](https://github.com/miquelbeltran/roomba-slack)._

## Installation

```bash
npm install
```

**Set up a webhook**

Start by setting up an [incoming webhook integration](https://my.slack.com/services/new/incoming-webhook/) in your Slack workspace.


**Sniff out BLID and password**

Before we can interact with our Roomba we need to figure out it's BLID (username) and password. To get started you need to know the LAN IP to your Roomba, and whether it is running the 1.x.x firmware or 2.x.x.

```bash
npm run getpassword 192.168.1.200 1
```


## Running

Before we run, we need to pass our configuration somehow. There are three common methods for setting environment variables. They are listed here in order of [the author's] convenience and preference:

1. **Using a .env file**

Create a `.env` file in this directory:

```
ROOMBA_BLID=""
ROOMBA_PASS=""
ROOMBA_IP=""
SLACK_WEBHOOK=""
```

Then run:

```bash
npm start
```

2. **Passing the options as runtime variables**

```bash
ROOMBA_BLID="" ROOMBA_PASS="" ROOMBA_IP="" SLACK_WEBHOOK="" npm start
```

3. **Setting environment variables**

```bash
export ROOMBA_BLID=""
export ROOMBA_PASS=""
export ROOMBA_IP=""
export SLACK_WEBHOOK=""
npm start
```
