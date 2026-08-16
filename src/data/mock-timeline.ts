export default {
  name: "Demo Project",
  duration: 60,
  tracks: [
    { id: "v1", name: "V1 - Camera A", type: "video", duration: 60, clips: [ { id: "c1", title: "Intro Shot", start: 0, length: 8 }, { id: "c2", title: "Surfer Walk", start: 8, length: 12 }, { id: "c3", title: "Sunset", start: 20, length: 20 } ] },
    { id: "v2", name: "V2 - B-Roll", type: "video", duration: 60, clips: [ { id: "c4", title: "B-Roll 1", start: 0, length: 14 }, { id: "c5", title: "B-Roll 2", start: 14, length: 24 } ] },
    { id: "a1", name: "A1 - Dialogue", type: "audio", duration: 60, clips: [ { id: "ac1", title: "Dialogue 1", start: 0, length: 28 } ] },
    { id: "m1", name: "M1 - Music", type: "music", duration: 60, clips: [ { id: "mc1", title: "Score Loop", start: 0, length: 60 } ] }
  ],
  sceneIntel: [
    { id: "s1", time: 4.2, label: "Establish", contextDuration: 60 },
    { id: "s2", time: 12.8, label: "Intro Beat", contextDuration: 60 },
    { id: "s3", time: 22.6, label: "Reveal", contextDuration: 60 },
    { id: "s4", time: 38.1, label: "Action", contextDuration: 60 }
  ]
};
