//By Joshua Brewster (MIT License)
export class DynamicParticles {
    constructor(
        rules=[
        ['boids',100],
        ['boids',50]
        ], 
        canvas=undefined,
        defaultCanvas=true
    ) {
        
        this.canvas = canvas;
        this.defaultCanvas=defaultCanvas;
        this.ctx = undefined;
        this.looping = false;

        this.startingRules = rules;

        /*
            Rule format:
            [
                [ //group 1 rule
                    'type', //named group type. Use addRule(...) to generate rulesets
                    maxcount,  //max number of particles
                    boundingBox[x,y,z], //bounding box for the group. Scales calculations accordingly. Can also use the canvas dimensions passed in by default
                    spawnRate, //number of particles added per frame (respawns all if undefined)
                    initialCount //initial count of particles (spawns all if undefined) 
                    useBoids, //use boids? mainly applies to the default function unless you integrate this into your own rules
                    timestepFunc, (per particle timestep, groups have additional rules for efficient scoping)
                    avoidanceGroups, index of groups to calculate avoidance (based on the this.particles index of the group)
                ], etc...
            ]
        */

        this.nGroups = this.startingRules.length;

        this.particles = [];
        this.maxParticles = 0; //max possible particles based on rulesets
        this.startingRules.forEach((rule)=>{
            this.totalParticles += rule[1];
        });

        this.colorScale = ['#000000', '#030106', '#06010c', '#090211', '#0c0215', '#0e0318', '#10031b', '#12041f', '#130522', '#140525', '#150628', '#15072c', '#16082f', '#160832', '#160936', '#160939', '#17093d', '#170a40', '#170a44', '#170a48', '#17094b', '#17094f', '#170953', '#170956', '#16085a', '#16085e', '#150762', '#140766', '#140669', '#13066d', '#110571', '#100475', '#0e0479', '#0b037d', '#080281', '#050185', '#020089', '#00008d', '#000090', '#000093', '#000096', '#000099', '#00009c', '#00009f', '#0000a2', '#0000a5', '#0000a8', '#0000ab', '#0000ae', '#0000b2', '#0000b5', '#0000b8', '#0000bb', '#0000be', '#0000c1', '#0000c5', '#0000c8', '#0000cb', '#0000ce', '#0000d1', '#0000d5', '#0000d8', '#0000db', '#0000de', '#0000e2', '#0000e5', '#0000e8', '#0000ec', '#0000ef', '#0000f2', '#0000f5', '#0000f9', '#0000fc', '#0803fe', '#2615f9', '#3520f4', '#3f29ef', '#4830eb', '#4e37e6', '#543ee1', '#5944dc', '#5e49d7', '#614fd2', '#6554cd', '#6759c8', '#6a5ec3', '#6c63be', '#6e68b9', '#6f6db4', '#7072af', '#7177aa', '#717ba5', '#7180a0', '#71859b', '#718996', '#708e91', '#6f928b', '#6e9786', '#6c9b80', '#6aa07b', '#68a475', '#65a96f', '#62ad69', '#5eb163', '#5ab65d', '#55ba56', '#4fbf4f', '#48c347', '#40c73f', '#36cc35', '#34ce32', '#37cf31', '#3ad130', '#3cd230', '#3fd32f', '#41d52f', '#44d62e', '#46d72d', '#48d92c', '#4bda2c', '#4ddc2b', '#4fdd2a', '#51de29', '#53e029', '#55e128', '#58e227', '#5ae426', '#5ce525', '#5ee624', '#60e823', '#62e922', '#64eb20', '#66ec1f', '#67ed1e', '#69ef1d', '#6bf01b', '#6df11a', '#6ff318', '#71f416', '#73f614', '#75f712', '#76f810', '#78fa0d', '#7afb0a', '#7cfd06', '#7efe03', '#80ff00', '#85ff00', '#89ff00', '#8eff00', '#92ff00', '#96ff00', '#9aff00', '#9eff00', '#a2ff00', '#a6ff00', '#aaff00', '#adff00', '#b1ff00', '#b5ff00', '#b8ff00', '#bcff00', '#bfff00', '#c3ff00', '#c6ff00', '#c9ff00', '#cdff00', '#d0ff00', '#d3ff00', '#d6ff00', '#daff00', '#ddff00', '#e0ff00', '#e3ff00', '#e6ff00', '#e9ff00', '#ecff00', '#efff00', '#f3ff00', '#f6ff00', '#f9ff00', '#fcff00', '#ffff00', '#fffb00', '#fff600', '#fff100', '#ffec00', '#ffe700', '#ffe200', '#ffdd00', '#ffd800', '#ffd300', '#ffcd00', '#ffc800', '#ffc300', '#ffbe00', '#ffb900', '#ffb300', '#ffae00', '#ffa900', '#ffa300', '#ff9e00', '#ff9800', '#ff9300', '#ff8d00', '#ff8700', '#ff8100', '#ff7b00', '#ff7500', '#ff6f00', '#ff6800', '#ff6100', '#ff5a00', '#ff5200', '#ff4900', '#ff4000', '#ff3600', '#ff2800', '#ff1500', '#ff0004', '#ff000c', '#ff0013', '#ff0019', '#ff001e', '#ff0023', '#ff0027', '#ff002b', '#ff012f', '#ff0133', '#ff0137', '#ff013b', '#ff023e', '#ff0242', '#ff0246', '#ff0349', '#ff034d', '#ff0450', '#ff0454', '#ff0557', '#ff065b', '#ff065e', '#ff0762', '#ff0865', '#ff0969', '#ff0a6c', '#ff0a70', '#ff0b73', '#ff0c77', '#ff0d7a', '#ff0e7e', '#ff0f81', '#ff1085', '#ff1188', '#ff128c', '#ff138f', '#ff1493'];

        this.rules = [
            {type:'default',groupRuleGen:this.defaultGroupRule, timestepFunc:this.defaultTimestepFunc, animateParticle:this.defaultAnimation},
            {type:'boids',groupRuleGen:this.defaultGroupRule, timestepFunc:this.defaultTimestepFunc, animateParticle:this.defaultAnimation }
        ]

        this.prototype = {
            position:{x:0,y:0,z:0},
            velocity:{x:0,y:0,z:0},
            acceleration:{x:0,y:0,z:0},
            force:{x:0,y:0,z:0},
            timestepFunc: undefined,//(group,particle,timeStep)=>{} per-particle step function you can customize
            type:"boids", //Behavior trees: boids, predators, plant cell, animal cell, algae, bacteria, atom, proton, neutron, electron, conway, can combine
            particleSize: 5,
            startingX: 0.5, 
            startingY: 0.5,
            maxSpeed: 40, 
            xBounce: -1,
            yBounce: -1,
            gravity: 0.0, //Downward z acceleration (-9.81m/s^2 = Earth gravity)
            mass:1,
            drag:0.033, //Drag coefficient applied to v(t-1)
            life:0, //Seconds since spawn
            lifeTime: 100000000, //Number of seconds before the particle despawns
            boundingBox:{left:0,right:1,bot:1,top:0,front:0,back:1}, //bounding box, 1 = max height/width of render window
            boid:{
                boundingBox:{left:0,right:1,bot:1,top:0,front:0,back:1}, //bounding box, 1 = max height/width of render window
                cohesion:0.003,
                separation:0.0001,
                alignment:0.006,
                swirl:{x:0.5,y:0.5,z:0.5,mul:0.002},
                attractor:{x:0.5,y:0.5,z:0.5,mul:0.003},
                avoidance:{groups:[],mul:0.1},
                useCohesion:true,
                useSeparation:true,
                useAlignment:true,
                useSwirl:true,
                useAttractor:true,
                useAvoidance:true,
                attraction: 0.00000000006674, //Newton's gravitational constant by default
                useAttraction:false, //particles can attract each other on a curve
                groupRadius:200,
                groupSize:10,
                searchLimit:10
            },
            plant:{
                diet:"photosynthetic", //if plant or animal cell: herbivore, carnivore, omnivore, photosynthetic, dead, dead_animal, dead_plant. Determines what other particles they will consume/trend toward
            },
            animal:{
                diet:"omnivore", //if plant or animal cell: herbivore, carnivore, omnivore, photosynthetic, dead, dead_animal, dead_plant. Determines what other particles they will consume/trend toward
            },
            bacteria:{},
            atom:{},
            proton:{},
            neutron:{},
            electron:{},
            conway:{
                survivalRange:[2,3], //nCell neighbors range for survival & reproduction
                reproductionRange:[3,3], //nCell neighbors range required to produce a living cell
                groupRadius:10 //pixel distance for grouping 
            }
            
        };

        this.init();
        
    }

    init = (rules=this.startingRules) => {
        if(this.canvas && this.defaultCanvas) {
            this.ctx = this.canvas.getContext("2d");
            window.addEventListener('resize',this.onresize());
        }

        rules.forEach((rule,i) => {
            //console.log(rule)
            let group = this.addGroup(rule);
        });

        if(!this.looping) {
            this.looping = true;
            this.loop();
        }
    }

    deinit = () => {
        this.looping = false;
        if(this.canvas) {
         window.removeEventListener('resize',this.onresize());
        } 
    }
    
    defaultAnimation = (particle) => {
        this.ctx.beginPath();
        let magnitude = Math.sqrt(particle.velocity.x*particle.velocity.x + particle.velocity.y*particle.velocity.y + particle.velocity.z*particle.velocity.z)
        
        var value = Math.floor(magnitude*255/(particle.maxSpeed*1.2));
        if(value > 255) { value = 255; }
        else if (value < 0) { value = 0; }
        this.ctx.fillStyle = this.colorScale[value];

        // Draws a circle of radius 20 at the coordinates 100,100 on the canvas
        this.ctx.arc(particle.position.x, particle.position.y, particle.particleSize, 0, Math.PI*2, true); 
        this.ctx.closePath();
        this.ctx.fill();

    }

    distance3D(a,b) //assumes you're passing two Array(3) i.e. [x,y,z]
    {
        if(Array.isArray(a)) { 
            return Math.sqrt((b[0]-a[0])*(b[0]-a[0]) + (b[1]-a[1])*(b[1]-a[1]) + (b[2]-a[2])*(b[2]-a[2]));
        }
        else {
            return Math.sqrt((b.x-a.x)*(b.x-a.x) + (b.y-a.y)*(b.y-a.y) + (b.z-a.z)*(b.z-a.z));
        }
    }  

    normalize3D(vec3 = []) {
        let normal;
        if(Array.isArray(vec3)) {
            normal = Math.sqrt(vec3[0]*vec3[0]+vec3[1]*vec3[1]+vec3[2]*vec3[2]);
            return [vec3[0]/normal,vec3[1]/normal,vec3[2]/normal];
        }
        else  {
            normal = Math.sqrt(vec3.x*vec3.x+vec3.y*vec3.y+vec3.z*vec3.z);
            return {x:vec3.x/normal,y:vec3.y/normal,z:vec3.z/normal};
        }
            
    }

    //Assign new properties to a group by index
    updateGroupProperties=(groupIdx,properties={},key=undefined,subkey=undefined)=>{
        if(key) {
            if(subkey)
            this.particles[groupIdx].particles.map(p=>Object.assign(p[key][subkey],properties));
            else
                this.particles[groupIdx].particles.map(p=>Object.assign(p[key],properties));
        
        }    else
            this.particles[groupIdx].particles.map(p=>Object.assign(p,properties));
    }

    defaultGroupRule = (particle,rule) =>{

        particle.type = rule[0];

        if(rule[1] > 3000 && rule[1] < 5000) {particle.boid.searchLimit = 3;}
        else if (rule[1]>=5000) {particle.boid.searchLimit = 1;}

        let avoidanceGroups = rule[7];
        if(avoidanceGroups){
            particle.boid.avoidance.groups = avoidanceGroups;
        } 

        let h=1,w=1,d=1;
        if(rule[2]){
             h = rule[2][0];
             w = rule[2][1];
             d = rule[2][2];
            particle.boid.separation *= (h+w+d)/3;
        }
        else if(this.canvas) {
             h = this.canvas.height;
             w = this.canvas.width;
             d = this.canvas.width;
        } else {
             h = 1;
             w = 1;
             d = 1;
        }
        let startX =  Math.random()*w;
        let startY =  Math.random()*h;
        let startZ =  Math.random()*d;
        particle.startingX = Math.random();
        particle.startingY = Math.random();
        particle.startingZ = Math.random();
        particle.position = {x:startX,y:startY,z:startZ};
        particle.boundingBox = {
            left:particle.boundingBox.left*w,
            right:particle.boundingBox.right*w,
            bot:particle.boundingBox.bot*h,
            top:particle.boundingBox.top*h,
            front:particle.boundingBox.front*d,
            back:particle.boundingBox.back*d
        };
        particle.boid.boundingBox = {
            left:particle.boid.boundingBox.left*w,
            right:particle.boid.boundingBox.right*w,
            bot:particle.boid.boundingBox.bot*h,
            top:particle.boid.boundingBox.top*h,
            front:particle.boid.boundingBox.front*d,
            back:particle.boid.boundingBox.back*d
        };
        particle.boid.attractor = {
            x:0.5*w,
            y:0.5*h,
            z:0.5*d,
            mul:particle.boid.attractor.mul
        };
        particle.boid.swirl = {
            x:0.5*w,
            y:0.5*h,
            z:0.5*d,
            mul:particle.boid.swirl.mul
        };
    } //can dynamically allocate particle group properties

    checkParticleBounds = (particle) => {
        
        if((particle.velocity.x > particle.maxSpeed) || (particle.velocity.y > particle.maxSpeed) || (particle.velocity.z > particle.maxSpeed) || (particle.velocity.x < -particle.maxSpeed) || (particle.velocity.y < -particle.maxSpeed) || (particle.velocity.z < -particle.maxSpeed)) {
            let normalized = this.normalize3D([particle.velocity.x,particle.velocity.y,particle.velocity.z]);
            particle.velocity.x = normalized[0]*particle.maxSpeed;
            particle.velocity.y = normalized[1]*particle.maxSpeed;
            particle.velocity.z = normalized[2]*particle.maxSpeed;
        }
        
        // Give the particle some bounce
        if ((particle.position.y - particle.particleSize) <= particle.boundingBox.top) {
            particle.velocity.y *= particle.yBounce;
            particle.position.y = particle.boundingBox.top + particle.particleSize;
        }
        if ((particle.position.y + particle.particleSize) >= particle.boundingBox.bot) {
            particle.velocity.y *= particle.yBounce;
            particle.position.y = particle.boundingBox.bot - particle.particleSize;
        }

        if (particle.position.x - (particle.particleSize) <= particle.boundingBox.left) {
            particle.velocity.x *= particle.xBounce;
            particle.position.x = particle.boundingBox.left + (particle.particleSize);
        }

        if (particle.position.x + (particle.particleSize) >= particle.boundingBox.right) {
            particle.velocity.x *= particle.xBounce;
            particle.position.x = particle.boundingBox.right - particle.particleSize;
        }

        if (particle.position.z - (particle.particleSize) <= particle.boundingBox.front) {
            particle.velocity.z *= particle.xBounce;
            particle.position.z = particle.boundingBox.front + (particle.particleSize);
        }

        if (particle.position.z + (particle.particleSize) >= particle.boundingBox.back) {
            particle.velocity.z *= particle.xBounce;
            particle.position.z = particle.boundingBox.back - particle.particleSize;
        }
    }


    defaultTimestepFunc = (group,timeStep)=>{ //what happens on each time step?

        if(group.particles.length < group.max) {
            let max = group.max;
            let count = group.particles.length;
            if(group.spawnRate) {
                count=0;
                max = group.spawnRate;
            
            }
            while(count < max) {
                //add a new particle
                group.particles.push(this.newParticle());
                group.groupRuleGen(group.particles[group.particles.length-1],group.rule);
                count++;
            }
        } else if (group.particles.length > group.max) {
            group.particles.splice(group.max);
        }

        if(group.useBoids) {
            let success = this.calcBoids(group.particles,timeStep);
            if(!success) console.error('boids error');
        }

        let expiredidx = [];
        group.particles.forEach((p,i) => {
            
            if(p.timestepFunc) p.timestepFunc(group, p, timeStep);

            if(p.gravity !== 0) p.velocity.y += p.gravity*timeStep;
            
            if(p.force.x !== 0){ 
                p.velocity.x += p.force.x*timeStep/p.mass;
            }
            if(p.force.y !== 0){
                p.velocity.y += p.force.y*timeStep/p.mass;
            }
            if(p.force.z !== 0){
                p.velocity.z += p.force.z*timeStep/p.mass;
            }

            if(p.acceleration.x !== 0){ 
                p.velocity.x += p.acceleration.x*timeStep;
            }
            if(p.acceleration.y !== 0){
                p.velocity.y += p.acceleration.y*timeStep;
            }
            if(p.acceleration.z !== 0){
                p.velocity.z += p.acceleration.z*timeStep;
            }

            if(p.velocity.x !== 0){
                p.position.x += p.velocity.x*timeStep;
            }
            if(p.velocity.y !== 0){
                p.position.y += p.velocity.y*timeStep;
            }
            if(p.velocity.z !== 0){
                p.position.z += p.velocity.z*timeStep;
            }

            this.checkParticleBounds(p);

            // Age the particle
            p.life+=timeStep;

            if(this.defaultCanvas) {
                group.animateParticle(p);
            }

            // If Particle is old, it goes in the chamber for renewal
            if (p.life >= p.lifeTime) {
                expiredidx.push(i);
            }

        });

        expiredidx.reverse().forEach((x)=>{
          group.particles.splice(x,1);
        });
    
    }

    calcAttraction = (particle1,particle2,distance,timeStep) => { 
        let deltax = particle2.position.x-particle1.position.x,
            deltay = particle2.position.y-particle1.position.y,
            deltaz = particle2.position.z-particle1.position.z;

        let Fg =  particle1.attraction * particle1.mass*particle2.mass/(distance*distance);

        let FgOnBody1x = Fg*deltax,
            FgOnBody1y = Fg*deltay,
            FgOnBody1z = Fg*deltaz;

        let v1x = timeStep*FgOnBody1x/particle1.mass,
            v1y = timeStep*FgOnBody1y/particle1.mass,
            v1z = timeStep*FgOnBody1z/particle1.mass;

        particle1.velocity.x += v1x;
        particle1.velocity.y += v1y;
        particle1.velocity.z += v1z;

        let v2x = -timeStep*FgOnBody1x/particle2.mass,
            v2y = -timeStep*FgOnBody1y/particle2.mass,
            v2z = -timeStep*FgOnBody1z/particle2.mass;

        particle2.velocity.x += v2x;
        particle2.velocity.y += v2y;
        particle2.velocity.z += v2z;

        return v1x, v1y, v1z, v2x, v2y, v2z;

    }

    //pass a particle group in, will add to particle velocities and return true if successful
    calcBoids = (particles=[],timeStep, from=0, to=particles.length) => {
        
        const newVelocities = [];
        outer:
        for(var i = from; i < to; i++) {
            let p0 = particles[i];
            const inRange = []; //indices of in-range boids
            const distances = []; //Distances of in-range boids
            const boidVelocities = [p0.position.x,p0.position.y,p0.position.z,0,0,0,p0.velocity.x,p0.velocity.y,p0.velocity.z,0,0,0,0,0,0,0,0,0]; //Velocity mods of in-range boids, representing each type of modifier
            /*
                cohesion, separation, alignment, attraction, avoidance
            */
            
           let groupCount = 1;
    
            nested:
            for(let j = 0; j < particles.length; j++) {
                let p = particles[j];
                if(distances.length > p0.boid.groupSize || j >= p0.boid.searchLimit) { break nested; }

                let randj = Math.floor(Math.random()*particles.length); // Get random index
                if(j===i || randj === i || inRange.indexOf(randj) > -1) {  } else {
                    let pr = particles[randj];
                    let disttemp = this.distance3D(p0.position,pr.position);
                    
                    if(disttemp > p0.boid.groupRadius) { } else {
                        distances.push(disttemp);
                        inRange.push(randj);
                
                        if(p0.boid.useCohesion){
                            boidVelocities[0] = boidVelocities[0] + pr.position.x;
                            boidVelocities[1] = boidVelocities[1] + pr.position.y;
                            boidVelocities[2] = boidVelocities[2] + pr.position.z;
                        }

                        if(isNaN(disttemp) || isNaN(boidVelocities[0]) || isNaN(pr.position.x)) {
                            console.log(disttemp, i, randj, p0.position, pr.position, boidVelocities); p0.position.x = NaN; 
                            return;
                        }

                        if(p0.boid.useSeparation){
                            let distInv = (p0.boid.groupRadius/(disttemp*disttemp));
                            if(distInv == Infinity) distInv = p.maxSpeed;
                            else if (distInv == -Infinity) distInv = -p.maxSpeed;
                            boidVelocities[3] = boidVelocities[3] + (p0.position.x-pr.position.x)*distInv;
                            boidVelocities[4] = boidVelocities[4] + (p0.position.y-pr.position.y)*distInv; 
                            boidVelocities[5] = boidVelocities[5] + (p0.position.z-pr.position.z)*distInv;
                        }

                        if(p0.boid.useAttraction) {
                            this.calcAttraction(p0,pr,disttemp,timeStep);
                        }

                        if(p0.boid.useAlignment){
                            //console.log(separationVec);
                            boidVelocities[6] = boidVelocities[6] + pr.velocity.x; 
                            boidVelocities[7] = boidVelocities[7] + pr.velocity.y;
                            boidVelocities[8] = boidVelocities[8] + pr.velocity.z;
                        }

                        groupCount++;
                    }
                }
            }
            
            if(p0.boid.useAvoidance && p0.boid.avoidance.groups.length > 0) {
                let searchidx = Math.floor(Math.random()*p0.boid.avoidanceGroups.length);
                const inRange2 = [];
                nested2:
                for(let k = 0; k < p0.searchLimit; k++) {
                    searchidx++;
                    let group = p0.boid.avoidanceGroups[searchidx%p0.boid.avoidanceGroups.length];
                    if(inRange2 > p0.boid.groupSize) { break nested2; }

                    let randj = Math.floor(Math.random()*group.length); // Get random index
                    if(j===i || randj === i || inRange2.indexOf(randj) > -1) {  } else {
                        let pr = group[randj];
                        let disttemp = this.distance3D(p0.position,pr.position);
                        
                        if(disttemp > p0.boid.groupRadius) { } else {
                            inRange2.push(randj);
                            let distInv = (p0.boid.groupRadius/(disttemp*disttemp));
                            if(distInv == Infinity) distInv = p.maxSpeed;
                            else if (distInv == -Infinity) distInv = -p.maxSpeed;
                            boidVelocities[15] = boidVelocities[15] + (p0.position.x-pr.position.x)*distInv;
                            boidVelocities[16] = boidVelocities[16] + (p0.position.y-pr.position.y)*distInv; 
                            boidVelocities[17] = boidVelocities[17] + (p0.position.z-pr.position.z)*distInv;
                        }
                    }
                } 

                boidVelocities[15] 
            }


            let _groupCount = 1/groupCount;
    
            if(p0.boid.useCohesion){
                boidVelocities[0] = p0.boid.cohesion*(boidVelocities[0]*_groupCount-p0.position.x);
                boidVelocities[1] = p0.boid.cohesion*(boidVelocities[1]*_groupCount-p0.position.y);
                boidVelocities[2] = p0.boid.cohesion*(boidVelocities[2]*_groupCount-p0.position.z);
            } else { boidVelocities[0] = 0; boidVelocities[1] = 0; boidVelocities[2] = 0; }

            if(p0.boid.useCohesion){
                boidVelocities[3] = p0.boid.separation*boidVelocities[3];
                boidVelocities[4] = p0.boid.separation*boidVelocities[4];
                boidVelocities[5] = p0.boid.separation*boidVelocities[5];
            } else { boidVelocities[3] = 0; boidVelocities[4] = 0; boidVelocities[5] = 0; }

            if(p0.boid.useCohesion){
                boidVelocities[6] = -(p0.boid.alignment*boidVelocities[6]*_groupCount);
                boidVelocities[7] = p0.boid.alignment*boidVelocities[7]*_groupCount;
                boidVelocities[8] = p0.boid.alignment*boidVelocities[8]*_groupCount;//Use a perpendicular vector [-y,x,z]
            } else { boidVelocities[6] = 0; boidVelocities[7] = 0; boidVelocities[8] = 0; }    

            const swirlVec = [0,0,0];
            if(p0.boid.useSwirl == true){
                boidVelocities[9] = -(p0.position.z-p0.boid.swirl.z)*p0.boid.swirl.mul;
                boidVelocities[10] = (p0.position.y-p0.boid.swirl.y)*p0.boid.swirl.mul;
                boidVelocities[11] = (p0.position.x-p0.boid.swirl.x)*p0.boid.swirl.mul
            }
            const attractorVec = [0,0,0];

            if(p0.boid.useAttractor == true){
                boidVelocities[12] = (p0.boid.attractor.x-p0.position.x)*p0.boid.attractor.mul;
                if(p0.position.x > p0.boid.boundingBox.left || p0.position.x < p0.boid.boundingBox.right) {
                    boidVelocities[12] *= 3; //attractor should be in the bounding box for this to work properly 
                }
                boidVelocities[13] = (p0.boid.attractor.y-p0.position.y)*p0.boid.attractor.mul;
                if(p0.position.y > p0.boid.boundingBox.top || p0.position.y < p0.boid.boundingBox.bottom) {
                    boidVelocities[13] *= 3;
                }
                boidVelocities[14] = (p0.boid.attractor.z-p0.position.z)*p0.boid.attractor.mul;
                if(p0.position.z > p0.boid.boundingBox.front || p0.position.z < p0.boid.boundingBox.back) {
                    boidVelocities[14] *= 3;
                }
            }
        
            //console.log(attractorVec)

            //if(i===0) console.log(p0, p0.position, p0.velocity, cohesionVec,separationVec,alignmentVec,swirlVec,attractorVec)

            newVelocities.push([
                p0.velocity.x*p0.drag+boidVelocities[0]+boidVelocities[3]+boidVelocities[6]+boidVelocities[9]+boidVelocities[12]+boidVelocities[15],
                p0.velocity.y*p0.drag+boidVelocities[1]+boidVelocities[4]+boidVelocities[7]+boidVelocities[10]+boidVelocities[13]+boidVelocities[16],
                p0.velocity.z*p0.drag+boidVelocities[2]+boidVelocities[5]+boidVelocities[8]+boidVelocities[11]+boidVelocities[14]+boidVelocities[17]
            ]);
            //console.log(i,groupCount)
            if(isNaN(newVelocities[newVelocities.length-1][0])) console.log(p0, i, groupCount, p0.position, p0.velocity, cohesionVec,separationVec,alignmentVec,swirlVec,attractorVec)
        }
    
        if(newVelocities.length === particles.length){ // Update particle velocities if newVelocities updated completely, else there was likely an error
            //console.log(newVelocities);
            
            
            particles.forEach((p,i) => {
                p.velocity.x += newVelocities[i][0];
                p.velocity.y += newVelocities[i][1];
                p.velocity.z += newVelocities[i][2];
            })
            //console.timeEnd("boid");
            return true;
        }
        else { console.error("Boids error"); return false; }
    
    }    

    addRule(
        type='',
        groupRuleGen=(particle,rule)=>{},
        groupTimestepFunc=(group,timestep)=>{},
        animateParticle=(particle)=>{}
    ) {
        if(type.length > 0 && typeof groupRuleGen === 'function' && typeof timestepFunc === 'function' && typeof animateParticle === 'function'){
            this.rules.push({
                type:type,
                groupRuleGen:groupRuleGen,
                timestepFunc:groupTimestepFunc,
                animateParticle:animateParticle
            });
        } else return false;
    }

    removeGroup(groupIdx=0) {
        if(!this.particles[groupIdx]) return false;

        this.maxParticles -= this.particles[groupIdx].max;
        this.particles.slice(groupIdx,1);
        return true;
    }

    addGroup( //type, count, bounding box, particle timestepFunc
        rule=['boids',50]
    ) 
        {
        
        if(!Array.isArray(rule)) return false;
        
        let type = rule[0];
        let maxcount = rule[1];
        let boundingBox = rule[2]; //passed to groupRuleGen
        let spawnCount = rule[3];
        let respawnRate = rule[4];
        let useBoids = rule[5]; //for the default function
        let pTimestepFunc = rule[6];

        if(!rule[0] || !rule[1]) return false;

        this.maxParticles += rule[1];

        let timestepFunc, groupRuleGen, animateParticle;
        
        this.rules.forEach((rule)=> {
            if(type === rule.type) {
                timestepFunc = rule.timestepFunc;
                groupRuleGen = rule.groupRuleGen;
                animateParticle = rule.animateParticle;
            }
        });

        if(!timestepFunc || !groupRuleGen || (this.defaultCanvas && !animateParticle)) return false;

        let newGroup = new Array(maxcount).fill(0);

        let attractorx = Math.random()*0.5+0.25;
        let attractory = Math.random()*0.5+0.25;
        let attractorz = Math.random()*0.5+0.25;


        if(spawnCount){
            for(let i = 0; i < spawnCount; i++){
                newGroup[i] = this.newParticle();
                groupRuleGen(newGroup[i],rule);
                if(pTimestepFunc) newGroup[i].timestepFunc = timestepFunc;
                if(type === 'boids') {
                    newGroup[i].boid.attractor.x = newGroup[i].boid.boundingBox.right*attractorx;
                    newGroup[i].boid.attractor.y = newGroup[i].boid.boundingBox.bot*attractory;
                    newGroup[i].boid.attractor.z = newGroup[i].boid.boundingBox.back*attractorz;
                    if(attractorx < 0.5) newGroup[i].boid.swirl.mul = -newGroup[i].boid.swirl.mul;
                }
            }
        } else {
            newGroup.forEach((p,i)=>{
                newGroup[i] = this.newParticle();
                groupRuleGen(newGroup[i],rule);
                if(type === 'boids'){
                    if(pTimestepFunc) newGroup[i].timestepFunc = timestepFunc;
                    newGroup[i].boid.attractor.x = newGroup[i].boid.boundingBox.right*attractorx;
                    newGroup[i].boid.attractor.y = newGroup[i].boid.boundingBox.bot*attractory;
                    newGroup[i].boid.attractor.z = newGroup[i].boid.boundingBox.back*attractorz;
                    if(attractorx < 0.5) newGroup[i].boid.swirl.mul = -newGroup[i].boid.swirl.mul;
                }
            });
        }
        this.particles.push(
        {
            rule:rule,
            type:type, 
            max:maxcount, 
            particles:newGroup, 
            timestepFunc:timestepFunc, 
            groupRuleGen:groupRuleGen,
            animateParticle:animateParticle,
            spawnRate:respawnRate, //respawn rate
            useBoids:useBoids,
            groupId:"id"+Math.floor(Math.random()*99999999)
        });

        return newGroup;

    }

    removeGroup = (idx) => {
        this.particles.splice(idx,1);
    }

    newParticle(assignments=undefined) {
        let proto = JSON.parse(JSON.stringify(this.prototype));
        if(assignments) Object.assign(proto,assignments);
        return proto;
    }

    setParticle(particle,assignments={}) {
        Object.assign(particle,assignments);
        return particle;
    }

    onresize = () => {
        if(this.canvas) {
            if(this.defaultCanvas) {
                this.canvas.width = this.canvas.parentNode.clientWidth;
                this.canvas.height = this.canvas.parentNode.clientHeight;

                this.canvas.style.width = this.canvas.parentNode.clientWidth;
                this.canvas.style.height = this.canvas.parentNode.clientHeight;
            }
            let proto = JSON.parse(JSON.stringify(this.prototype));
            this.particles.forEach((p) => {
                let h = this.canvas.height;
                let w = this.canvas.width;
                p.boundingBox = { //Auto resize based on default bounding box settings
                    left:proto.boundingBox.left*w,
                    right:proto.boundingBox.right*w,
                    bot:proto.boundingBox.bot*h,
                    top:proto.boundingBox.top*h,
                    front:proto.boundingBox.front*h,
                    back:proto.boundingBox.back*h
                };
                p.boid.boundingBox = {
                    left:proto.boid.boundingBox.left*w,
                    right:proto.boid.boundingBox.right*w,
                    bot:proto.boid.boundingBox.bot*h,
                    top:proto.boid.boundingBox.top*h,
                    front:proto.boid.boundingBox.front*h,
                    back:proto.boid.boundingBox.back*h
                };
            });
        }
    }

    loop = (lastFrame=performance.now()*0.001,ticks=0) => {
        if(this.looping === false) return; 
        
        let currFrame = performance.now()*0.001;
        let timeStep = currFrame - lastFrame;
        //console.log(timeStep,);
        if(this.defaultCanvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.particles.forEach((group) => {
            group.timestepFunc(group,timeStep);
            
            if(isNaN(group.particles[0].position.x)) {
                console.log(timeStep,ticks,group.particles[0]);
                this.looping = false;
                return;
            }
        });

        // console.log(
        //     timeStep,
        //     this.particles[0].particles[0].position,
        //     this.particles[0].particles[0].velocity
        //     );

        let tick = ticks+1;
        setTimeout(()=>{requestAnimationFrame(()=>{this.loop(currFrame,tick)})},15);
    }

}