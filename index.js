/*
  https://www.freecodecamp.org/news/create-a-discord-bot-with-javascript-nodejs/
*/
const keepAlive = require("./server")
require('dotenv').config();
// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'ODIzOTkxNDAwMjkwNDUxNDg2.YFo3yg.nHZpFjO9gV7kKRTjjWD6_Wnm9Zc';

function endTimer(message) {
    if (breakTime) {
        message.channel.send('Break is over. Get back to work!');
    } else {
        message.channel.send('Study session is over. Time for a break!');
    }
    timer = null;
    return;
}

function getTimeLeft(timeout) {
    if (timeout === null) return [-1, 0];
    let seconds = Math.ceil((((timeout._idleTimeout - (Date.now() - timeout.start))/ 1000))) % 60;
    let minutes = Math.floor((((timeout._idleTimeout - (Date.now() - timeout.start))/ 1000)) / 60);
    return [minutes, seconds];
}

client.on('ready', () => {
    console.log('I am ready!');
});

// Create an event listener for messages
var timer = null; //timer object keeps track of time
var breakTime = 0; // Boolean to determine if user is on break. Set to 1 when on break and 0 otherwise.
client.on('message', message => {
    // if not sent to main chat or if the message is from the bot
    if (message.channel.type != 'text' || message.author.bot || !message.content.startsWith("$")) {
        return;
    }
    // Message is of the format "$pomo NUMBER", starts a timer for NUMBER minutes
    if (message.content.startsWith('$pomo')) {
        if (timer !== null) {
            message.channel.send("Timer already exists. You must stop timer ('$stop') before you start a new one.");
        } else { // otherwise start the timer
            msg = message.content.split(" ");
            let x = parseInt(msg[1]);
            if (!(x === x)) { //check if NaN
                message.channel.send('Invalid input');
            } else {

                timer = setTimeout(endTimer, x * 1000 * 60, message, timer);
                timer.start = Date.now();
                if (x === 1) {
                    message.channel.send('Study timer started for ' + x + ' minute');
                } else {
                    message.channel.send('Study timer started for ' + x + ' minutes');
                }
                breakTime = 0;
            }
        }
    }
    if (message.content.startsWith('$help')) {
      message.channel.send("$pomo #, $break #, $time, $stop");
    }
    // when user wants to start their break
    if (message.content.startsWith('$break')) {
        if (timer !== null) {
            message.channel.send("Timer already exists. You must stop timer ('$stop') before you start a new one.");
        } else { // otherwise start the timer
            msg = message.content.split(" ");
            let x = parseInt(msg[1]);
            if (!(x === x)) { //check if NaN
                message.channel.send('Invalid input');
            } else {

                timer = setTimeout(endTimer, x * 1000 * 60, message, timer);
                timer.start = Date.now();
                if (x === 1) {
                    message.channel.send('Break timer started for ' + x + ' minute');
                } else {
                    message.channel.send('Break timer started for ' + x + ' minutes');
                }
                breakTime = 1;
            }
        }
    }
    // stop timer
    if (message.content === '$stop') {
      if (timer === null) {
        message.channel.send("No active timer to stop.");
      } else {
        clearTimeout(timer);
        timer = null;
        message.channel.send("Timer stopped.")
        breakTime = 0;
      }
    }
    // ask for time remaining on current timer. Returns time in minutes.
    if (message.content === '$time') {
        time = getTimeLeft(timer);
        if (time[0] === -1) {
            message.channel.send("No active timer");
        } else { // composing message
            var minutes = time[0];
            var seconds = time[1];
            var numberMinute; // Whether to say minute or minutes
            var breakMsg; // whether to say break or study session
            if (breakTime) {
                breakMsg = " left in break."
            } else {
                breakMsg = " left in study session."
            }
            var colon;
            if (seconds >= 10) {
              colon = ":";
            } else {
              colon = ":0"
            }
            message.channel.send(minutes +  colon + seconds + breakMsg);
        }
    }
});

keepAlive();
// Log our bot in
client.login(process.env.BOT_TOKEN);
