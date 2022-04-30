
// create Agora client
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
var name_part = "";
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var remoteUsers = {};
// Agora client options
var options = {
  appid: null,
  channel: null,
  uid: null,
  token: null
};
var name_id="";
var local_vedio=""
var name=""
// the demo can auto join channel with params in url
$(() => {
  var urlParams = new URL(location.href).searchParams;
  options.appid = urlParams.get("appid");
  options.channel = urlParams.get("channel");
  options.token = urlParams.get("token");
  if (options.appid && options.channel) {
    $("#appid").val(options.appid);
    $("#token").val(options.token);
    $("#channel").val(options.channel);
    $("#join-form").submit();
  }
})

// $("#join-form").submit(async function (e) {
//   e.preventDefault();
//   $("#join").attr("disabled", true);
//   try {
//     options.appid = "9b94330a7f994cc6ad7bed16ce496dfd";
//     options.token = "0069b94330a7f994cc6ad7bed16ce496dfdIACiI5rotGIvp+TGMxPzYsvPbh3XSps12mTVw/5IrzZbRsqFUwsAAAAAEAAg4mLWyX5AYgEAAQDJfkBi";
//     options.channel = "temp";
//     await join();
//     if(options.token) {
//       $("#success-alert-with-token").css("display", "block");
//     } else {
//       $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
//       $("#success-alert").css("display", "block");
//     }
//   } catch (error) {
//     console.error(error);
//   } finally {
//     $("#leave").attr("disabled", false);
//   }
// })
$("#join_meet").click(async function (e) {
  e.preventDefault();
  console.log("ooo");
  let ame=document.getElementById("usr_name").value;
  console.log();
  name_id=ame;
  document.getElementById('join_form').style.display = "none";
  document.getElementById('join_meet').style.display = "none";
  document.getElementById('usr_name').style.display = "none";
  document.getElementById('main').style.display = "block";
  try {
    options.appid = "9b94330a7f994cc6ad7bed16ce496dfd";
    options.token = "0069b94330a7f994cc6ad7bed16ce496dfdIACokTDeUn1q0CvRGqhPNycR8koIn5nJJWoP5VPfICY2mSj3EwwAAAAAEABD/MfDRN9tYgEAAQBC321i";
    options.channel = "meeet1";
    await join(ame);
    if(options.token) {
      $("#success-alert-with-token").css("display", "block");
    } else {
      $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
      $("#success-alert").css("display", "block");
    }
  } catch (error) {
    console.error(error);
  } finally {
    $("#leave").attr("disabled", false);
  }
})

$("#leave").click(function (e) {
  leave();
})

async function join(ame) {
  name_part=ame;
  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);
debugger;
  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  [ options.uid, localTracks.audioTrack, localTracks.videoTrack ] = await Promise.all([
    // join the channel
    client.join(options.appid, options.channel, options.token || null),
    // create local tracks, using microphone and camera
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack()
  ]);
  
  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo (${name_id})`);

  local_vedio="video_"+localTracks.videoTrack._ID
  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
  console.log("publish success");

}

async function leave() {
  for (trackName in localTracks) {
    var track = localTracks[trackName];
    if(track) {
      track.stop();
      track.close();
      localTracks[trackName] = undefined;
    }
  }

  // remove remote users and player views
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // leave the channel
  await client.leave();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  console.log("client leaves channel success");
  document.getElementById('join_form').style.display = "block";
  document.getElementById('join_meet').style.display = "block";
  document.getElementById('usr_name').style.display = "block";
  document.getElementById('main').style.display = "none";
}

async function subscribe(user, mediaType) {
  console.log("hiii")
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");
  if (mediaType === 'video') {
    const player = $(`
      <div class="col-4" id="player-wrapper-${uid}">
        <p class="player-name">remoteUser(${uid})</p>
        <div id="player-${uid}" class="player"></div>
      </div>
    `);
    $("#remote-playerlist").append(player);
    user.videoTrack.play(`player-${uid}`);
  }
  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
}
function loop() {
  console.log('This pops up every 5 seconds and is annoying!');
  console.log(local_vedio)
  let video = document.getElementById(local_vedio);
  console.log(video)
  var canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//convert to desired file format
var dataURI = canvas.toDataURL('image/jpeg'); // can also use 'image/png'
mood(dataURI)


}

setInterval(loop, 10000);
function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}

function handleUserUnpublished(user) {
  const id = user.uid;
  delete remoteUsers[id];
  $(`#player-wrapper-${id}`).remove();
}
async function mood (uri)  {
  console.log(uri)
  await nets.ssdMobilenetv1.loadFromUri('./models');
  await nets.faceExpressionNet.loadFromUri('./models');

  const image = uri;
  // const canvas = faceapi.createCanvasFromMedia(image);
  const detection = await detectAllFaces(image).withFaceExpressions();
  
  //By using javasript json parser
  var det = detection[0].expressions;

  var expList = [];
  expList.push(det.angry);
  expList.push(det.disgusted);
  expList.push(det.fearful);
  expList.push(det.sad);
  expList.push(det.happy);
  expList.push(det.neutral);
  expList.push(det.surprised);

  var maxId = expList.indexOf(Math.max(...expList));

  if(maxId <= 3){
      console.log(Math.round(1 - expList[maxId]) * 10);
  }
  else {
      console.log(Math.ceil(expList[maxId]) * 10);
  }
};

