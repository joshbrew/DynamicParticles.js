## DynamicParticles.js

This is a little experimental particle vector calculator. It lets you quickly generate groups of particles with specified rulesets. 

It comes with boids by default, they are very efficient and I had 10,000 on screen by reducing the group search count per boid, and the canvas was by far the limiting factor. will add more in time to replicate some stuff I saw on youtube. Just open the particleTest.html file to see and tinker with this:

https://user-images.githubusercontent.com/18196383/124330212-c9354200-db41-11eb-99c9-c73f86fdce3c.mp4

Example Usage:

`npm i dynamicparticles`

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
import {DynamicParticles} from 'dynamicparticles'

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

