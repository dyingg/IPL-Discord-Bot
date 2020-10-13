const request = require("request");
const discord = require("discord.js");
const Sentry = require("@sentry/node");

function liveWin(hook) {
  request(
    "https://www.google.com/async/lr_mt_fp?ei=E7iFX834F9OR9QOg6IX4Cg&yv=3&p3=1&async=sp:5,lmid:%2Fm%2F03b_lm1,emid:%2Fg%2F11k7xz_dn4,tab:dt,pbp:false,ct:IN,hl:en,tz:Asia%2FCalcutta,_fmt:jspb",
    {
      gzip: true,
    },
    (err, resp, body) => {
      if (err) {
        return Sentry.captureException(err);
      }

      let naiveParse = body.split("Live win probability");

      let probability = naiveParse[0]
        .split("[[[")[1]
        .split("]")[0]
        .split(",")
        .map((k) => parseInt(k.slice(1, -1)));

      let content = naiveParse[1];

      let teams = content
        .split("null,null")[1]
        .split("\n")
        .slice(0, 2)
        .map((k) => JSON.parse(k.substring(1)));

      let color = probability[0] > probability[1] ? teams[0][1] : teams[1][1];

      let embed = new discord.MessageEmbed()
        .setTitle("Live Win Probability")
        .setColor(color)
        .setAuthor(
          "Google",
          "https://media.discordapp.net/attachments/634747520328925184/765587509463351306/google-logo-png-webinar-optimizing-for-success-google-business-webinar-13.png?width=679&height=679"
        )
        .addField(teams[0][0], `${probability[0]}%`, true)
        .addField(teams[1][0], `${probability[1]}%`, true)
        .setFooter("IPLT20| Dying#0001");
      hook.send(embed);
    }
  );
}

module.exports = liveWin;
