'use strict';

const sampleRate = 16000;
const unitDuration = 0.14;
const pauseDuration = 0.025;
const frequencies = [220, 300, 380, 460, 540, 620, 700, 780];

function seededRandom(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function buildSignal(units, options = {}) {
  const noise = options.noise || 0;
  const extraPauseAfter = options.extraPauseAfter ?? -1;
  const extraPauseSec = options.extraPauseSec || 0;
  const random = seededRandom(options.seed || 1);
  const samples = [];
  const ranges = [];
  for (let i = 0; i < units.length; i++) {
    const freq = units[i];
    const start = samples.length;
    const n = Math.round(unitDuration * sampleRate);
    for (let j = 0; j < n; j++) {
      const attack = Math.min(1, j / (0.015 * sampleRate));
      const release = Math.min(1, (n - 1 - j) / (0.015 * sampleRate));
      const env = Math.max(0, Math.min(attack, release));
      const harmonic = 0.65 * Math.sin(2 * Math.PI * freq * j / sampleRate)
        + 0.25 * Math.sin(2 * Math.PI * freq * 2 * j / sampleRate)
        + 0.10 * Math.sin(2 * Math.PI * freq * 3 * j / sampleRate);
      samples.push(env * harmonic + noise * (random() * 2 - 1));
    }
    const end = samples.length;
    ranges.push({index: i, startSample: start, endSample: end});
    let pause = pauseDuration;
    if (i === extraPauseAfter) pause += extraPauseSec;
    for (let j = 0; j < Math.round(pause * sampleRate); j++) samples.push(noise * 0.2 * (random() * 2 - 1));
  }
  return {signal: Float32Array.from(samples), ranges};
}

function timeStretchPreservePitch(input, factor) {
  const chunk = 160;
  const chunks = [];
  for (let i = 0; i < input.length; i += chunk) chunks.push(input.slice(i, Math.min(input.length, i + chunk)));
  const out = [];
  for (let i = 0; i < chunks.length; i++) {
    out.push(...chunks[i]);
    if (factor > 1 && i % Math.max(1, Math.round(1 / (factor - 1))) === 0) out.push(...chunks[i]);
  }
  return Float32Array.from(out);
}

function resamplePitchShift(input, factor) {
  const outputLength = Math.max(1, Math.round(input.length * factor));
  const output = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const x = i / factor;
    const x0 = Math.floor(x);
    const x1 = Math.min(input.length - 1, x0 + 1);
    const t = x - x0;
    output[i] = input[Math.min(x0, input.length - 1)] * (1 - t) + input[x1] * t;
  }
  return output;
}

const analysisFreqs = [180,220,260,300,340,380,420,460,500,540,580,620,660,700,740,780,820];
const frameSize = 320;
const hopSize = 160;

function extractFeatures(signal) {
  const frames = [];
  for (let start = 0; start + frameSize <= signal.length; start += hopSize) {
    const feature = [];
    let rms = 0;
    for (let n = 0; n < frameSize; n++) rms += signal[start+n] * signal[start+n];
    rms = Math.sqrt(rms / frameSize);
    feature.push(Math.log(1e-5 + rms));
    for (const freq of analysisFreqs) {
      let re = 0, im = 0;
      for (let n = 0; n < frameSize; n++) {
        const window = 0.5 - 0.5 * Math.cos(2 * Math.PI * n / (frameSize - 1));
        const value = signal[start+n] * window;
        const angle = 2 * Math.PI * freq * n / sampleRate;
        re += value * Math.cos(angle);
        im -= value * Math.sin(angle);
      }
      feature.push(Math.log(1e-5 + Math.sqrt(re*re + im*im)));
    }
    const mean = feature.reduce((a,b)=>a+b,0)/feature.length;
    let norm = 0;
    for (let i=0;i<feature.length;i++){ feature[i]-=mean; norm += feature[i]*feature[i]; }
    norm = Math.sqrt(norm)+1e-8;
    frames.push(Float32Array.from(feature.map(v=>v/norm)));
  }
  return frames;
}

function cosineDistance(a,b){
  let dot=0;
  for(let i=0;i<a.length;i++) dot += a[i]*b[i];
  return Math.max(0, Math.min(2, 1-dot));
}

function dtw(reference, query){
  const n=reference.length,m=query.length;
  const cost=Array.from({length:n+1},()=>new Float64Array(m+1).fill(Infinity));
  const prev=Array.from({length:n+1},()=>new Uint8Array(m+1));
  cost[0][0]=0;
  for(let i=1;i<=n;i++) for(let j=1;j<=m;j++){
    const d=cosineDistance(reference[i-1],query[j-1]);
    const diag=cost[i-1][j-1], up=cost[i-1][j]+0.03, left=cost[i][j-1]+0.03;
    if(diag<=up && diag<=left){cost[i][j]=d+diag;prev[i][j]=0;}
    else if(up<=left){cost[i][j]=d+up;prev[i][j]=1;}
    else {cost[i][j]=d+left;prev[i][j]=2;}
  }
  const path=[]; let i=n,j=m;
  while(i>0&&j>0){path.push([i-1,j-1]);const p=prev[i][j];if(p===0){i--;j--;}else if(p===1)i--;else j--;}
  path.reverse();
  return {normalizedCost:cost[n][m]/Math.max(1,path.length),path};
}

function localize(referenceRanges, alignment, refFeatures, queryFeatures){
  const costsByUnit=referenceRanges.map(()=>[]);
  for(const [ri,qi] of alignment.path){
    const center=ri*hopSize+frameSize/2;
    const unit=referenceRanges.findIndex(r=>center>=r.startSample&&center<r.endSample);
    if(unit>=0) costsByUnit[unit].push(cosineDistance(refFeatures[ri],queryFeatures[qi]));
  }
  return costsByUnit.map((v,index)=>({unit:index,meanCost:v.length?v.reduce((a,b)=>a+b,0)/v.length:null,alignedFrames:v.length}));
}

function run(){
  const referenceBuilt=buildSignal(frequencies,{noise:0});
  const referenceFeatures=extractFeatures(referenceBuilt.signal);
  const wrong=frequencies.slice(); wrong[4]=260;
  const missing=frequencies.filter((_,i)=>i!==3);
  const base=buildSignal(frequencies,{noise:0.01,seed:9}).signal;
  const cases={
    same_with_noise: buildSignal(frequencies,{noise:0.015,seed:7}).signal,
    slower_preserve_pitch: timeStretchPreservePitch(base,1.25),
    slower_pitch_shifted: resamplePitchShift(base,1.25),
    missing_unit_3: buildSignal(missing,{noise:0.01,seed:11}).signal,
    wrong_unit_4: buildSignal(wrong,{noise:0.01,seed:13}).signal,
    extra_pause_after_2: buildSignal(frequencies,{noise:0.01,extraPauseAfter:2,extraPauseSec:0.30,seed:15}).signal
  };
  const results={};
  for(const [name,signal] of Object.entries(cases)){
    const q=extractFeatures(signal); const a=dtw(referenceFeatures,q); const loc=localize(referenceBuilt.ranges,a,referenceFeatures,q);
    const worst=loc.filter(x=>x.meanCost!==null).sort((a,b)=>b.meanCost-a.meanCost)[0];
    results[name]={queryFrames:q.length,normalizedCost:+a.normalizedCost.toFixed(6),worstReferenceUnit:worst?.unit??null,perUnitMeanCost:loc.map(x=>x.meanCost===null?null:+x.meanCost.toFixed(6))};
  }
  return {experiment:'001-browser-dtw-synthetic',runtime:`node ${process.version}`,platform:process.platform,arch:process.arch,configuration:{sampleRate,frameSize,hopSize},results};
}

if(require.main===module) console.log(JSON.stringify(run(),null,2));
module.exports={run};
