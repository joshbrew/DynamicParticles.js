## DynamicParticles.js

This is a little experimental particle vector calculator. It lets you quickly generate groups of particles with specified rulesets. 

It comes with boids by default, will add more in time to replicate some stuff I saw on youtube. 

Example Usage:

HTML:
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body> 
    <canvas id='canvas' style='width:80vw;height:80vh;'></canvas>
</body>
</html>
```


JS:
```
let canvas = document.getElementById('canvas');

let Particles = new DynamicParticles(
  [
    ['boids',1000],
    ['boids',300],
    ['boids',800]
  ],
  canvas,
  true
);

Particles.addRule( //See code for example functions
      'newrule',
      (particle,rule)=>{}, //groupRuleGen (called when a particle is created): particle format: See DynamicParticles.prototype (line 29); rule format: [type='type',count=500]
      (group,timeStep)=>{}, //timestepFunc (called each frame):  group format: [{particle0},{particle1},...{particleN}]; timeStep: seconds between frames
      (particle)=>{} //animateParticle (called per particle per frame): particle format: See DynamicParticles.prototype (line 29)
  );
  
Particles.addGroup(['newrule',300]);

```

