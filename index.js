const request = require("request");
const Sentry = require("@sentry/node");
const discord = require("discord.js");

const bbtoMark = require("bbcode-to-markdown");
const Tracing = require("@sentry/tracing");

//https://discordapp.com/api/webhooks//
const hook = new discord.WebhookClient(
  "764889019191525396",
  "bHvLwJhJ-w9cNivfKHnUXh6DqSUt_wnlzc0INB5vjG6sbS3aZeZ7OFW9Ba37o5WJuLfD"
);

let logged = {};

let lastID = 0;

Sentry.init({
  dsn:
    "https://935d6e3962bb4af29eca03a9ffe2074a@o459792.ingest.sentry.io/5459814",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});
/**
 * Types - Eov
 */

const liveWin = require("./liveWin.js");

function tick() {
  console.log("Running");
  request(
    "https://cricketapi.platform.iplt20.com/fixtures/22264/commentary?customer=bcci&pageSize=6&sort=desc&cache=" +
      Date.now(),
    {
      headers: {
        dismay: Date.now(),
      },
      gzip: true,
      json: true,
    },
    (err, resp, body) => {
      if (err) {
        Sentry.captureException(err);
      } else {
        try {
          if (
            body.commentaries.content &&
            body.commentaries.content.length > 0
          ) {
            for (let content of body.commentaries.content.reverse()) {
              if (!content) {
                return console.log(content);
              }

              if (lastID >= content.id) {
                continue;
              }

              lastID = content.id;

              if (content.type === "Auto") {
                let preferedSpeed = (content.details.speed * 3.6).toFixed(2);
                let rawText = bbtoMark(content.details.bbcode).replace(
                  "%SPEED%",
                  `${preferedSpeed} km/h`
                );

                let title = `${content.details.countingProgress.over}.${content.details.countingProgress.ball}`;

                if (content.tags.length > 0) {
                  title = `${title} - ${content.tags[0].toUpperCase()}`;
                }

                console.log(content);

                let embed = new discord.MessageEmbed()
                  .setAuthor(
                    "LIVE",
                    "https://media.discordapp.net/attachments/764861405454139392/764879532389564456/92Of6SKPBqav3iUs3c2qRWKJd3ZQchmwgAAAAAAAA.png"
                  )
                  .setTitle(title)
                  .setDescription(rawText)
                  .setThumbnail(
                    `https://static.iplt20.com/players/100x115/${content.details.facingBatsmanId}.png`
                  )
                  .setFooter("IPLT20| Dying#0001");
                hook.send(embed);
              } else if (content.type === "Eov") {
                let details = content.details;
                let team = content.details.team;
                let bowler = details.bowlerSummary.bowler;
                let bSum = details.bowlerSummary;
                let embed = new discord.MessageEmbed()
                  .setAuthor(
                    "LIVE",
                    "https://media.discordapp.net/attachments/764861405454139392/764879532389564456/92Of6SKPBqav3iUs3c2qRWKJd3ZQchmwgAAAAAAAA.png"
                  )
                  .setTitle(`End of Over ${details.over}`)
                  .setColor(`#${team.primaryColor}`)
                  .setDescription(
                    `${team.fullName} are **${details.inningsRuns} /${details.inningsWickets}**\nRuns this over **${details.overRuns}**\nWickets this over **${details.overWickets}**\n**${bowler.fullName}** (Overs: ${bSum.overs} Runs: ${bSum.runs} Wickets: ${bSum.wickets})`
                  )
                  .setThumbnail(
                    `https://static.iplt20.com/players/100x115/${bowler.id}.png`
                  )
                  .setFooter("IPLT20| Dying#0001");

                for (let batsmanSum of details.batsmanSummaries) {
                  let { batsman } = batsmanSum;
                  embed.addField(
                    `${batsman.fullName} (${
                      batsman.rightHandedBat ? "RHB" : "LHB"
                    })`,
                    `**${batsmanSum.runs}** (${batsmanSum.balls}) [${batsmanSum.fours} fours | ${batsmanSum.sixes} sixes]`,
                    true
                  );
                }

                hook.send(embed);
                liveWin(hook);
              } else if (content.type === "Manual") {
                if (!content.details.bbcode) {
                  return console.log(content);
                }

                let rawText = bbtoMark(content.details.bbcode)
                  .split("\\n")
                  .join("\n");
                let embed = new discord.MessageEmbed()
                  .setAuthor(
                    "LIVE",
                    "https://media.discordapp.net/attachments/764861405454139392/764879532389564456/92Of6SKPBqav3iUs3c2qRWKJd3ZQchmwgAAAAAAAA.png"
                  )
                  .setColor("#34eb8c")
                  .setDescription(rawText)
                  .setFooter("IPLT20| Dying#0001");

                hook.send(embed);
              }
            }
          }
        } catch (e) {
          console.log(e);
          Sentry.captureEvent(err);
        }
      }
    }
  );
}

setInterval(tick, 2000);
