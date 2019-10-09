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
		console.log('Begin handler:'+doorLockState);
		// Clear delay if door opened
		clearTimeout(self.timer);
		var doorLockState = vDev.get("metrics:level");
		if (doorLockState == "close") {
			self.controller.devices.get(self.config.DoorLock).performCommand("open");
			//self.log('Closed to open:'+doorLockState);
		} else if (doorLockState == "open") {
			self.controller.devices.get(self.config.DoorLock).performCommand("close");
			//self.log('Open to closed:'+doorLockState);
		}
		// Close lock if sensor false
		// Start Timer
		self.timer = setInterval(function () {		
			//self.log('SetInterval');
			doorLockState = vDev.get("metrics:level");
			var doorLockDeviceType = vDev.get("deviceType");

			// Check lock, if already closed don't send command
			if (!(self.config.doNotSendCommand && (doorLockState == "close" || doorLockState == "on"))) {
				// Close lock 
				if (doorLockDeviceType == "doorlock") {
					if (doorLockState == "open") {
						self.controller.devices.get(self.config.DoorLock).performCommand("close");
					}
					else if (doorLockState == "close") {
						self.controller.devices.get(self.config.DoorLock).performCommand("open");
					}
				}
				if (doorLockDeviceType == "switchBinary") {
					self.controller.devices.get(self.config.DoorLock).performCommand("on");	
				}
			}
			// And clearing out this.timer variable
			//self.timer = null;
		}, self.config.delay*1000);
	};

	// Setup metric update event listener
	this.controller.devices.on(this.config.DoorLock, 'change:metrics:level', this.handler);
};

Lock.prototype.stop = function () {
	Lock.super_.prototype.stop.call(this);

	if (this.timer)
		clearTimeout(this.timer);

	this.controller.devices.off(this.config.DoorLock, 'change:metrics:level', this.handler);
};
