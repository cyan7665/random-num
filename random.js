let bpmInput, timeSignatureInput;
let bpm, beatsPerMeasure, noteValue;
let interval, beatInterval;
let defaultinterval,defaultbeatInterval;
let lastTime = 0, lastBeatTime = 0;
let currentNumber = 0;
let nextNumber = 0;
let measureSound, beatSound; // 音声ファイルを格納する変数
let osc1, osc2;

let osc1_flag = false;
let osc2_flag = false;
let fps = 60;
let intervalTime = 0;
let bpm_now;
let count=0;


// PID制御のための変数
let kp = 0.01, ki = 0.01, kd = 0.05;
let previousError = 0;
let integral = 0;
let error = 0;
let derivative = 0;
let adjustment = 0;

function preload() {

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(64);
  textAlign(CENTER, CENTER);
  bpmInput = select('#bpm');
  timeSignatureInput = select('#timeSignature');
  frameRate(fps); // フレームレートを60に固定
  nextNumber = floor(random(1, 7));

        // オシレータの設定1
        osc1 = new p5.Oscillator('sine');
        osc1.amp(0.5);
        osc1.freq(440);
        osc1.start();
        osc1.amp(0); // 初期状態では音を出さない
    
        // オシレータの設定2
        osc2 = new p5.Oscillator('sine');
        osc2.amp(0.5);
        osc2.freq(540);
        osc2.start();
        osc2.amp(0); // 初期状態では音を出さない
// ボタンのクリックイベントにstart関数を紐付ける
  select('#startButton').mousePressed(start);

}

function draw() {
  push();
  background(255);
  textSize(32);
  text("  Next  " + nextNumber, width * 5 / 8, height * 4 / 7);
  bpm_now = 60000 / intervalTime;
  text(int(bpm_now), width * 7 / 8, height * 6 / 7);
  //小さく表示
  textSize(64);
  text(currentNumber, width / 2, height / 2);
  let currentTime = millis();
  pop();



  if(intervalTime!=0){
    // PID制御を用いて、bpmを一定に保つ
    error = bpm - bpm_now;
    if (Math.abs(error)>50){
      error = 0;
    }
    //error = constrain(error, -10, 10); // 誤差に制限を加える
    integral += error;
    //integral = constrain(integral, -100, 100); // 積分の値に制限を加える
    derivative = error - previousError;
    adjustment = kp * error + ki * integral + kd * derivative;

    // 調整量の制限
    adjustment = constrain(adjustment, -20, 20); // 調整量に制限を加える

    // beatIntervalを調整する
    beatInterval = (60.0 / (bpm + adjustment)) * 1000;
    interval = beatInterval * beatsPerMeasure;
    previousError = error;
    //console.log(adjustment);
  }

    // 残り時間を計算
    let timeElapsed = currentTime - lastTime;
    let timeRemaining = interval - timeElapsed;
    let arcAngle = map(timeRemaining, 0, interval, 0, TWO_PI);

  // 円弧を描画
  push();
  noFill();
  stroke(0);
  strokeWeight(8);
  arc(width / 2, height / 2, 150, 150, -HALF_PI, -HALF_PI + arcAngle);
  pop();

  var play_flag = true;
/*
  if (timeElapsed >= interval-(1000/fps)) { // 1小節ごとに音を再生し、数字を変更
    intervalTime = currentTime - lastBeatTime;
    currentNumber = nextNumber;
    nextNumber = floor(random(1, 7));
    lastTime += defaultinterval;
    lastBeatTime = lastTime;

    playMeasureOsc();
    play_flag = false;
  }*/

  if (play_flag == true) {
    if (currentTime - lastBeatTime >= beatInterval-(1000/fps)) { // 1拍ごとに音を再生

      
        if(count==0){
          intervalTime = currentTime - lastBeatTime;
          currentNumber = nextNumber;
          nextNumber = floor(random(1, 7));
          lastTime += defaultinterval;
          lastBeatTime = lastTime;
      
          playMeasureOsc();
          play_flag = false;
        }else{
        //console.log(currentTime - lastBeatTime);
        intervalTime = currentTime - lastBeatTime;
        playBeatOsc();
        lastBeatTime += defaultbeatInterval;
      }
      count++;
      count %=beatsPerMeasure;
    }
  }
}


function start() {
  // オーディオコンテキストを再開
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume().then(() => {
      console.log('Audio context resumed');
    });
  }

  bpm = int(bpmInput.value());
  let timeSignature = timeSignatureInput.value().split('/');
  beatsPerMeasure = int(timeSignature[0]);
  noteValue = int(timeSignature[1]);

  // 1拍の長さをミリ秒で計算
  beatInterval = (60.0 / bpm) * 1000;
  // 1小節の長さをミリ秒で計算
  interval = beatInterval * beatsPerMeasure;
  defaultinterval=interval;
  defaultbeatInterval=beatInterval;
  lastTime = millis();
  lastBeatTime = lastTime;

  //fps=int(60/(1000/defaultbeatInterval))*(1000/defaultbeatInterval);
  
  frameRate(fps); // フレームレートを60に固定
  console.log(beatInterval);
  console.log(fps);
}

function playMeasureOsc() {
  //let audioContext = getAudioContext();
  //let now = audioContext.currentTime;
  osc2.start();
  osc2.amp(0.5,0.01); // 即座に音量を上げる
  osc2.amp(0, 0.1,0.01); // 0.2秒後に音量を下げる
  osc2.stop(0.1);
}

function playBeatOsc() {
  //let audioContext = getAudioContext();
  //let now = audioContext.currentTime;
  osc1.start();
  osc1.amp(0.5,0.01); // 即座に音量を上げる
  osc1.amp(0, 0.1,0.01); // 0.2秒後に音量を下げる
  osc1.stop(0.1);
}

//現在のフレームレート算出する
function drawFPS() {
  textSize(32);
  fill(0);
  text("FPS: " + int(frameRate()),width*5  / 8, height * 4/7);
}

//最大公約数を求める
const gcd = (a, b) => {
  let tmp;
  if (a>b){
    tmp = a;
    a = b;
    b = tmp;
  }
  // a < b とする
  let maxDivisor = 1;  // 最大公約数
  for(let div=2; div<=a; div++) {
      if(a % div === 0 && b % div === 0) {
          maxDivisor = div;
      }
  }
  
  return maxDivisor;
}
