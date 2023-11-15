import { RenderAnimation,lerp,lerpOutCubic,isPoseReady } from "$data/animation";
import { MODEL_TYPE } from "$src/data/common";
 const NewOutfitBottomAnimation = new RenderAnimation(
    function (scene, keepData = false, modelName) {
      let data: any = {
        head: scene.getObjectByName("Head"),
        body: scene.getObjectByName("Body"),
        leftarm: scene.getObjectByName("LeftArm"),
        rightarm: scene.getObjectByName("RightArm"),
        leftleg: scene.getObjectByName("LeftLeg"),
        rightleg: scene.getObjectByName("RightLeg"),
      };
      data.head.parent.remove(data.head);
  
      data.body.add(data.head);
      data.head.position.set(0, 0, 0);
  
      data.leftarm.parent.remove(data.leftarm);
      data.rightarm.parent.remove(data.rightarm);
  
      data.body.add(data.leftarm);
      data.body.add(data.rightarm);
  
      const armDistanceX = 0.31; // Adjust this value to change the distance of the arms from the body in the x direction
      const armDistanceZ = 0.0; // Adjust this value to change the distance of
      // Set the position of the arms relative to the body
      if (modelName ==MODEL_TYPE.STEVE) {
        data.leftarm.position.set(-armDistanceX, -0.12, -armDistanceZ);
        data.rightarm.position.set(armDistanceX, -0.12, armDistanceZ);
      } else {
        data.leftarm.position.set(-armDistanceX, -0.15, -armDistanceZ);
        data.rightarm.position.set(armDistanceX, -0.15, armDistanceZ);
      }
  
      if (keepData) {
        return data;
      } else {
        data.isRotatingDown = true;
        data.downRotation = -30 * (Math.PI / 180);
        data.bodyDownRotation = 10 * (Math.PI / 180);
        data.isLookingLeft = false;
        data.isLookingRight = false;
        data.leftRotation = 30 * (Math.PI / 180);
        data.rightRotation = -30 * (Math.PI / 180);
        data.armRot = (Math.random() * 10 + 5) * (Math.PI / 180);
        data.speed = 1;
        data.angle = 0;
        data.returnSpeed = 0.01;
      }
      return data;
    },
    function () {
      return true;
    },
    function (data, scene, clock, modelName,elapsedRenderTime) {
      const resetSpeed = 0.02; // Adjust this value to change the speed of the reset
      const epsilon = 0.01; // Adjust this value to change the precision of the equality check
      const amplitude = 0.025;
      const elapsedTime = clock;
  
      const cSin = 1 * Math.sin(clock);
      if (data.head) {
        if (data.isRotatingDown || data.isLookingLeft || data.isLookingRight) {
          data.rightleg.rotation.x = lerpOutCubic(clock,
            data.rightleg.rotation.x,
            -0.2 + 0.06 * cSin,
            data.returnSpeed
          );
          data.rightleg.position.z = lerpOutCubic(clock,
            data.rightleg.position.z,
            -0.02 + 0.04 * cSin,
            data.returnSpeed
          );
          const delay = 0.5; // Adjust this value to change the delay
    
          data.leftleg.rotation.x = lerpOutCubic(clock,
            data.leftleg.rotation.x,
            0 + 0.03 * Math.sin(elapsedRenderTime + delay),
            data.returnSpeed
          );
          data.leftleg.position.z = lerpOutCubic(clock,
            data.leftleg.position.z,
            0 + 0.03 * Math.sin(elapsedRenderTime + delay),
            data.returnSpeed
          );
        }
        if (data.isRotatingDown) {
          data.isLookingLeft = true;
          // Interpolate between the current rotation and the down rotation
          data.leftleg.rotation.x = lerpOutCubic(clock,
            data.leftleg.rotation.x,
            0.01,
            resetSpeed
          );
          data.head.rotation.x = lerpOutCubic(clock,
            data.head.rotation.x,
            data.downRotation,
            resetSpeed
          );
          data.body.rotation.x = lerpOutCubic(clock,
            data.body.rotation.x,
            data.bodyDownRotation,
            resetSpeed
          );
          data.body.position.z = lerpOutCubic(clock,
            data.body.position.z,
            data.bodyDownRotation,
            resetSpeed
          );
  
          data.leftarm.rotation.z = lerpOutCubic(clock,
            data.leftarm.rotation.z,
            data.armRot * -1,
            resetSpeed
          );
  
          data.rightarm.rotation.z = lerpOutCubic(clock,
            data.rightarm.rotation.z,
            data.armRot,
            resetSpeed
          );
  
          // If the head is close enough to the down rotation, set the rotation to the down rotation
          if (Math.abs(data.head.rotation.x - data.downRotation) < epsilon) {
            data.head.rotation.x = data.downRotation;
            data.isRotatingDown = false;
          }
        }
        if (data.isLookingLeft) {
          // Interpolate between the current rotation and the left rotation
          data.head.rotation.y = lerpOutCubic(clock,
            data.head.rotation.y,
            data.leftRotation,
            resetSpeed
          );
  
          // If the head is close enough to the left rotation, set the rotation to the left rotation
          if (Math.abs(data.head.rotation.y - data.leftRotation) < epsilon) {
            data.head.rotation.y = data.leftRotation;
            data.isLookingLeft = false;
            data.isLookingRight = true;
          }
        } else if (data.isLookingRight) {
          // Interpolate between the current rotation and the right rotation
          data.head.rotation.y = lerpOutCubic(clock,
            data.head.rotation.y,
            data.rightRotation,
            resetSpeed
          );
  
          // If the head is close enough to the right rotation, set the rotation to the right rotation
          if (Math.abs(data.head.rotation.y - data.rightRotation) < epsilon) {
            data.head.rotation.y = data.rightRotation;
            data.isLookingRight = false;
          }
        } else {
          // Interpolate between the current rotation and 0
          data.head.rotation.x = lerpOutCubic(clock,
            data.head.rotation.x,
            0,
            resetSpeed
          );
          data.body.rotation.x = lerpOutCubic(clock,
            data.body.rotation.x,
            0,
            resetSpeed
          );
          data.body.position.z = lerpOutCubic(clock,
            data.body.position.z,
            0,
            resetSpeed
          );
          data.head.rotation.z = lerpOutCubic(clock,
            data.head.rotation.z,
            0,
            resetSpeed
          );
  
          data.head.rotation.y = lerpOutCubic(clock,
            data.head.rotation.y,
            0,
            resetSpeed
          );
  
          data.leftarm.rotation.z = lerpOutCubic(clock,
            data.leftarm.rotation.z,
            0,
            resetSpeed
          );
  
          data.rightarm.rotation.z = lerpOutCubic(clock,
            data.rightarm.rotation.z,
            0,
            resetSpeed
          );
  
          data.body.position.y = lerpOutCubic(clock,
            data.body.position.y,
            1.47,
            resetSpeed
          );
          // If the head is close enough to 0, set the rotation to 0
          if (
            isPoseReady([
              { value: data.head.rotation.x, target: 0 },
              { value: data.body.rotation.x, target: 0 },
              { value: data.body.position.z, target: 0 },
              { value: data.head.rotation.y, target: 0 },
              { value: data.head.rotation.z, target: 0 },
              { value: data.leftarm.rotation.z, target: 0 },
              { value: data.rightarm.rotation.z, target: 0 },
            ])
          ) {
            return true;
          }
          return false;
        }
      }
    }
  );
  export default NewOutfitBottomAnimation;