/*** AutoLock Z-Way Home Automation module *************************************

 Version: 1.2
 (c) Z-Wave.Me, 2017

 -----------------------------------------------------------------------------
 Author: Ben Windheim (ben.windheim@vacasa.com) 
 Description: Door/Window Sensor automatically closes lock after delay when door is closed

******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------
function Lock (id, controller) {
	console.log("[DIY] BEGIN");
	// Call superconstructor first (AutomationModule)
	Lock.super_.call(this, id, controller);
	// Create instance variables
	this.timer = null;
};

inherits(Lock, AutomationModule);
_module = Lock;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------
Lock.prototype.init = function (config) {
	// Call superclass' init (this will process config argument and so on)
	Lock.super_.prototype.init.call(this, config);

	var self = this;
	
	// handler - it is a name of your function
	this.handler = function (vDev) {
		console.log("[DIY] In the handler");
		// Clear delay if door opened
		clearTimeout(self.timer);
		var doorLockState = vDev.get("metrics:level");
		console.log("[DIY] Handler called with Door Lock State: " + doorLockState);

	/*	if (doorLockState == "close") {
			vDev.set("open");
			doorLockState = vDev.get("metrics:level");
			console.log("[DIY] Closed to open: " + doorLockState);
		} else if (doorLockState == "open") {
			vDev.set("close");	
			doorLockState = vDev.get("metrics:level");
			console.log("[DIY] Open to closed: " + doorLockState);
		}*/
		// Close lock if sensor false
		// Start Timer
		self.timer = setInterval(function () {		
			console.log("DIY] SetInterval");
			doorLockState = vDev.get("metrics:level");
			console.log("[DIY] Check door lock state: " + doorLockState);
			var doorLockDeviceType = vDev.get("deviceType");
			console.log("[DIY] doorLockDeviceType: " + doorLockDeviceType);

			// Check lock, if already closed don't send command
		
			// Close lock 
			if (doorLockDeviceType == "doorlock") {
				if (doorLockState == "open") {
					console.log("[DIY] Setting to close");
					vDev.set("metrics:level:0");
				}
				else if (doorLockState == "close") {
					console.log("[DIY] Setting to open");
					vDev.set("metrics:level:255");
				}
			}
			if (doorLockDeviceType == "switchBinary") {
				console.log("[DIY] Binary!!!");
				self.controller.devices.get(self.config.DoorLock).performCommand("on");	
				self.controller.devices.get(self.config.DoorLock).performCommand("off");	
			}
			
			// And clearing out this.timer variable
			//self.timer = null;
		}, self.config.delay*1000);
	};

	// Setup metric update event listener
	this.controller.devices.on(this.config.DoorLock, 'change:metrics:level', this.handler);
};

Lock.prototype.stop = function () {
	console.log("[DIY] Stop function");
	Lock.super_.prototype.stop.call(this);

	if (this.timer) {
		clearInterval(this.timer);
	}
	this.controller.devices.off(this.config.DoorLock, 'change:metrics:level', this.handler);
};
