var colorStrQueue = [];

/**
  * Author: Alonso Vidales <alonso.vidales@tras2.es>
  * Date: 2012-03-25
  *
  * This class is used to control all the player features
  *
  * @see config.player
  *
  * @param inCompressor <object>: Compressor_Controller object
  *
  */
var Player_Controller = (function(inCompressor) {
	var compressor = inCompressor;
	// Will contain the penguin animated image object (AnimatedImage_Tool)
	var penguin = null;
	// Will contain the penguin animated image object (AnimatedImage_Tool)
	var shooter = null;
	// Will determinate if the user are moving the shooter to the right, left or are stopped
	var currentMovement = null;
	// Will contain a pointer to the shooter "setTimeout" that handles the rotation movement
	var rotationLoop = null;
	// Contains the number of degrees from the vertical axe that the shooter is rotated
	var shooterRotatedDeg = 0;
	// Will contain the object of the bubble in the chamber
	var chamberBubble = null;
	// Will contain the object of the bubble in the loaded in the shooter
	var shooterBall = null;
	// Will contain a pointer to the timeout that launches the ball after the hurry alert
	var hurryTimeout = null;
	// Will contain a pointer to the timeout that shows the "hurry" alert
	var alertTimeout = null;
	// Determinate if all the game is stopped
	var stopped = false;

	/**
	  * This method rotate the shooter to the left, and animate the penguin image
	  * with the corresponding animation
	  *
	  * @see: AnimatedImage_Tool
	  *
	  */
	var moveToLeft = function() {
		if (currentMovement !== 'left') {
			currentMovement = 'left';

			// Animate the penguin
			penguin.animate({
				from: config.player.imageAttr.leftAnimationFrom,
				to: config.player.imageAttr.leftAnimationTo});
		}
	};

	/**
	  * This method rotate the shooter to the right, and animate the penguin image
	  * with the corresponding animation
	  *
	  * @see: AnimatedImage_Tool
	  *
	  */
	var moveToRight = function() {
		if (currentMovement !== 'right') {
			currentMovement = 'right';

			// Animate the penguin image
			penguin.animate({
				from: config.player.imageAttr.rightAnimationFrom});
		}
	};

	/**
	  * This method is called after a movement ends, and returns the penguin image to the main image
	  *
	  * @see: AnimatedImage_Tool
	  *
	  */
	var moveToCenter = function() {
		if (currentMovement == 'right') {
			penguin.animate({
				from: config.player.imageAttr.rightAnimationTo,
				to: (config.player.imageAttr.rightAnimationFrom - 1)});
		}

		if (currentMovement == 'left') {
			penguin.animate({
				from: config.player.imageAttr.leftAnimationTo,
				to: config.player.imageAttr.leftAnimationFrom});
		}

		currentMovement = null;
	};

	/**
	  * This method is all the time checking if a rotation way is settled, and in
	  * this case move rotate the shooter according to the way
	  *
	  */
	var rotateObserver = function() {
		if (currentMovement !== null) {
			if (currentMovement == 'left') {
				if (shooterRotatedDeg != config.shooter.maxRotationDegLeft) {
					shooter.rotate(--shooterRotatedDeg);
				}
			}

			if (currentMovement == 'right') {
				if (shooterRotatedDeg != config.shooter.maxRotationDegRight) {
					shooter.rotate(++shooterRotatedDeg);
				}
			}
		}

		// Create a loop that checks all the periodically if a rotation is in course
		rotationLoop = setTimeout(rotateObserver, config.player.rotationSpeedLoop);
	};

	/**
	  * This method is called to shoot a new bubble
	  *
	  * @see: AnimatedImage_Tool
	  *
	  */
	var shoot = function() {
        // FIXME Disable Sound
		// SoundManager_Tool.play(config.player.shotSnd);

		// Move the ball into the chamber to the shooter
		chargeChamberBall();

		// Check if the player try to shoot a bubble before a bubble is loaded
		if (shooterBall !== null) {
			shooterBall.shoot(shooterRotatedDeg, compressor);
		}
		shooterBall = null;

		// Show the corresponding penguin animation
		penguin.animate({
			from: config.player.imageAttr.shootAnimationFrom,
			to: config.player.imageAttr.shootAnimationTo});

		currentMovement = null;

		// Reset the timer that obligates the user to shoot
        // FIXME hurry disabled
		// resetHurry();
	};

	/**
	  * This method creates and a new Bubble_Controller object and
	  * adds it to the chamber
	  *
	  */
	var addNewBubbleToChamber = function() {
		var colours = compressor.getBubbleColours();
		var type = colours[Math.floor(Math.random() * (colours.length - 1))];

		shooterBall = chamberBubble;

		chamberBubble = new Bubble_Controller(
			0,
			config.shooter.top + config.shooter.height - 10,
			type);

		chamberBubble.init();

		// Move the bubble to the chamber position
		chamberBubble.moveTo(
			config.shooter.left + (config.shooter.width / 2) - (config.bubbles.width / 2),
			config.shooter.top + config.shooter.height - 10);

		// TODO gets the bubble color
        colorStr = getColorFromType(chamberBubble.getType());
        // localStorage.setItem('colors', currWord);
        console.log(colorStr);
        colorStrQueue.push(colorStr);
        setNextColor();
	};

	/**
	  * This method moves the bubble from the chamber to the shooter position,
	  * and calls to the addNewBubbleToChamber method to create a new bubble
	  *
	  */
	var chargeChamberBall = function() {
		if (chamberBubble === null) {
			addNewBubbleToChamber();
		}

		chamberBubble.moveTo(
			config.shooter.left + (config.shooter.width / 2) - (config.bubbles.width / 2),
			config.shooter.top + (config.shooter.height / 2) - 16,
			function() {
				addNewBubbleToChamber();
			});
	};

    // FIXME hurry disabled
	/**
	  * This method remove all the timeouts for the hurry alert, and reinitialize
	  * all them again
	  *
	  */
	// var resetHurry = function() {
	// 	if (hurryTimeout !== null) {
	// 		clearTimeout(hurryTimeout);
	// 	}
	// 	if (alertTimeout !== null) {
	// 		clearTimeout(alertTimeout);
	// 		UserAlerts_Tool.removeAlert();
     //        // FIXME Disable Sound
	// 		// SoundManager_Tool.stop(config.player.hurrySnd);
	// 	}
	// 	hurryTimeout = setTimeout(function() {
	// 		// The time to show the alert is finished, ahor the alert message
     //        // FIXME Disable Sound
     //        // SoundManager_Tool.play(config.player.hurrySnd, true);
    //
	// 		UserAlerts_Tool.showAlert('hurry', true);
	// 		alertTimeout = setTimeout(function() {
	// 			// The max timeout ends, stop the alert message and launch the bubble
     //            // FIXME Disable Sound
	// 			// SoundManager_Tool.stop(config.player.hurrySnd);
	// 			shoot();
	// 			UserAlerts_Tool.removeAlert();
	// 		}, config.player.timeToShowHurry);
	// 	}, config.player.timeToShoot);
	// };

	return {
		/**
		  * This method should be called when the level ends and the user wins
		  *
		  */
		win: function() {
			if (!stopped) {
                // FIXME Disable Sound
				// SoundManager_Tool.play(config.player.winSnd);

				// Stop all the timers in order to stop all the animations
				stopped = true;
				clearTimeout(rotationLoop);
				clearTimeout(hurryTimeout);
				clearTimeout(alertTimeout);

				// Show the penguin "winner" animation in a loop
				penguin.setClass('winner');
				penguin.animate({
					from: config.player.winnerImageAttr.animationFrom,
					to: config.player.winnerImageAttr.animationTo,
					type: 'loop'
				});
			}
		},

		/**
		  * This method should be called when the game ends and the user lost it :(
		  *
		  */
		gameOver: function() {
			if (!stopped) {
                // FIXME Disable Sound
				// SoundManager_Tool.play(config.player.gameOverSnd);

				// Stop all the timers in order to stop all the animations
				stopped = true;
				clearTimeout(rotationLoop);
				clearTimeout(hurryTimeout);
				clearTimeout(alertTimeout);

				// Show the penguin "winner" animation in a loop
				penguin.setClass('looser');
				penguin.animate({
					from: config.player.loserImageAttr.animationFrom,
					to: config.player.loserImageAttr.animationTo
				});
			}
		},

		/**
		  * Init method, creates all the elements, and initialize them
		  *
		  * @see: AnimatedImage_Tool
		  *
		  */
		init: function() {
			// Create the shooter animated image
			shooter = new AnimatedImage_Tool('shooter');
			shooter.init();
			shooter.setPos(config.shooter.left, config.shooter.top);
			shooter.show();

			// Create the user penguin animated image
			penguin = new AnimatedImage_Tool(
				'penguin',
				19,
				config.player.imageAttr.loopTime,
				config.player.imageAttr.images);
			penguin.init();
			penguin.setPos(config.player.left, config.player.top);
			penguin.show();

			// Create the init bubbles for the shooter and chamber
			chargeChamberBall();
			rotateObserver();

			// Initialize the hurry alert method
            // FIXME hurry disabled
			// resetHurry();

			// Add the events to detect the keys for user controllers
			document.addEventListener('keydown', function(inEvent) {
				if (!stopped && !isDone) {
					switch (inEvent.keyCode) {
						// Trigger key
						case config.player.controls.trigger:
						case config.player.controls.secondTrigger:
						    // TODO here is where shoot key is pressed
						    nextWord();
							shoot();
							break;

						// Left key
						case config.player.controls.left:
							moveToLeft();
							break;

						// Right key
						case config.player.controls.right:
							moveToRight();
							break;
					}
				}
			});

			document.addEventListener('keyup', function(inEvent) {
				moveToCenter();
			});
		}
	};
});

function getColorFromType(colorCode) {
    if (colorCode == 0) {
        return "BLACK";
    } else if (colorCode == 1) {
        return "BLUE";
    } else if (colorCode == 2) {
        return "GREEN";
    } else if (colorCode == 3) {
        return "ORANGE";
    } else if (colorCode == 4) {
        return "PURPLE";
    } else if (colorCode == 5) {
        return "RED";
    } else if (colorCode == 6) {
        return "WHITE";
    } else if (colorCode == 7) {
        return "YELLOW";
    }
}
