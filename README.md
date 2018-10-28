# Assignment 5 Whack-A-Robot

Assignment No 5 for the computer graphics course. 

Based on the Class demos, create a [whack a mole](https://en.wikipedia.org/wiki/Whac-A-Mole) style game. The game must have a score, and a timer. When the timer ends, the game stops and an option to restart is given. The user has to interact with a 3D object in the scene that has different animations. You can use the robot model that was used in the demos.

Rubric:

1. Loaded a 3D model with different animations.
2. Create a *dead* animation for the model using keyframes and existing animations.
3. The user can interact correctly with the 3D model, and when an interaction happens, the *dead* animation is played. The model is then erased from the scene after a little while.
4. A high score and timer are correctly implemented.
5. UI feedback messages (to start or restart the game) are correctly displayed.

**NOTES**

1. The interaction is not done correctly. You are using the canvas for the aspect ratio of the window instead of the canvas' size.
2. When I click a robot, the dead animation is not ran correctly; it is removed from the scene before the animation can be seen.

**Grade: 80**